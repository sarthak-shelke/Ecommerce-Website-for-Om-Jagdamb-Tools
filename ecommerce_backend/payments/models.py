from django.db import models
from django.utils import timezone
import uuid

class Payment(models.Model):
    """Payment model"""
    PAYMENT_METHOD_CHOICES = [
        ('stripe', 'Stripe'),
        ('razorpay', 'Razorpay'),
        ('paypal', 'PayPal'),
        ('cod', 'Cash on Delivery'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
        ('partially_refunded', 'Partially Refunded'),
    ]
    
    payment_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payments')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Payment amounts
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    
    # Gateway specific fields
    gateway_payment_id = models.CharField(max_length=200, blank=True, null=True)
    gateway_response = models.JSONField(blank=True, null=True)
    
    # Transaction details
    transaction_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Timestamps
    initiated_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)
    failed_at = models.DateTimeField(blank=True, null=True)
    
    # Additional info
    failure_reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'payments_payment'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-initiated_at']
    
    def __str__(self):
        return f"Payment #{str(self.payment_id)[:8]} - {self.order.order_number} - ₹{self.amount}"
    
    @property
    def payment_number(self):
        return str(self.payment_id)[:8].upper()
    
    def save(self, *args, **kwargs):
        if not self.net_amount:
            self.net_amount = self.amount - self.transaction_fee
        super().save(*args, **kwargs)

class Refund(models.Model):
    """Refund model"""
    REFUND_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    REFUND_TYPE_CHOICES = [
        ('full', 'Full Refund'),
        ('partial', 'Partial Refund'),
    ]
    
    refund_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    refund_type = models.CharField(max_length=20, choices=REFUND_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=REFUND_STATUS_CHOICES, default='pending')
    
    # Refund amounts
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    
    # Gateway specific fields
    gateway_refund_id = models.CharField(max_length=200, blank=True, null=True)
    gateway_response = models.JSONField(blank=True, null=True)
    
    # Timestamps
    requested_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Additional info
    processed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'payments_refund'
        verbose_name = 'Refund'
        verbose_name_plural = 'Refunds'
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"Refund #{str(self.refund_id)[:8]} - ₹{self.amount}"
    
    @property
    def refund_number(self):
        return str(self.refund_id)[:8].upper()

class PaymentMethod(models.Model):
    """Saved Payment Methods for users"""
    CARD_TYPE_CHOICES = [
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('amex', 'American Express'),
        ('discover', 'Discover'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='payment_methods')
    payment_method_type = models.CharField(max_length=20, choices=Payment.PAYMENT_METHOD_CHOICES)
    
    # Card details (encrypted/tokenized)
    card_type = models.CharField(max_length=20, choices=CARD_TYPE_CHOICES, blank=True, null=True)
    last_four_digits = models.CharField(max_length=4, blank=True, null=True)
    expiry_month = models.PositiveIntegerField(blank=True, null=True)
    expiry_year = models.PositiveIntegerField(blank=True, null=True)
    
    # Gateway specific token
    gateway_token = models.CharField(max_length=200, blank=True, null=True)
    
    # Metadata
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'payments_method'
        verbose_name = 'Payment Method'
        verbose_name_plural = 'Payment Methods'
        ordering = ['-created_at']
    
    def __str__(self):
        if self.card_type and self.last_four_digits:
            return f"{self.user.full_name} - {self.card_type.title()} ****{self.last_four_digits}"
        return f"{self.user.full_name} - {self.payment_method_type.title()}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            # Set all other payment methods for this user to not default
            PaymentMethod.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
