from rest_framework import serializers
from .models import Payment, Refund, PaymentMethod

class PaymentSerializer(serializers.ModelSerializer):
    """Payment serializer"""
    payment_number = serializers.ReadOnlyField()
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'payment_id', 'payment_number', 'order', 'order_number',
                 'payment_method', 'status', 'amount', 'currency',
                 'gateway_payment_id', 'transaction_fee', 'net_amount',
                 'initiated_at', 'completed_at', 'failed_at', 'failure_reason']
        read_only_fields = ['id', 'payment_id', 'gateway_payment_id', 
                           'transaction_fee', 'net_amount', 'initiated_at',
                           'completed_at', 'failed_at', 'failure_reason']

class CreatePaymentIntentSerializer(serializers.Serializer):
    """Create payment intent serializer"""
    order_id = serializers.UUIDField()
    payment_method = serializers.CharField()
    return_url = serializers.URLField(required=False)

class ConfirmPaymentSerializer(serializers.Serializer):
    """Confirm payment serializer"""
    payment_intent_id = serializers.CharField()
    payment_method_id = serializers.CharField(required=False)

class RefundSerializer(serializers.ModelSerializer):
    """Refund serializer"""
    refund_number = serializers.ReadOnlyField()
    payment_number = serializers.CharField(source='payment.payment_number', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)
    
    class Meta:
        model = Refund
        fields = ['id', 'refund_id', 'refund_number', 'payment', 'payment_number',
                 'refund_type', 'status', 'amount', 'reason', 'gateway_refund_id',
                 'requested_at', 'processed_at', 'completed_at', 'processed_by_name',
                 'admin_notes']
        read_only_fields = ['id', 'refund_id', 'gateway_refund_id', 'requested_at',
                           'processed_at', 'completed_at', 'processed_by_name']

class RefundRequestSerializer(serializers.Serializer):
    """Refund request serializer"""
    payment_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    reason = serializers.CharField()
    refund_type = serializers.ChoiceField(choices=Refund.REFUND_TYPE_CHOICES)

class PaymentMethodSerializer(serializers.ModelSerializer):
    """Payment method serializer"""
    class Meta:
        model = PaymentMethod
        fields = ['id', 'payment_method_type', 'card_type', 'last_four_digits',
                 'expiry_month', 'expiry_year', 'is_default', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
