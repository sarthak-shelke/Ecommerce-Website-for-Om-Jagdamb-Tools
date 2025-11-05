from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator

class Cart(models.Model):
    """Shopping Cart model"""
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cart_cart'
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
    
    def __str__(self):
        return f"Cart for {self.user.full_name}"
    
    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())
    
    @property
    def total_amount(self):
        return sum(item.total_price for item in self.items.all())
    
    @property
    def is_empty(self):
        return not self.items.exists()

class CartItem(models.Model):
    """Cart Item model"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    added_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cart_item'
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        unique_together = ['cart', 'product']
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity} in {self.cart.user.full_name}'s cart"
    
    @property
    def unit_price(self):
        return self.product.price
    
    @property
    def total_price(self):
        return self.unit_price * self.quantity
    
    def save(self, *args, **kwargs):
        # Update cart's updated_at when item is saved
        super().save(*args, **kwargs)
        self.cart.save()

class Wishlist(models.Model):
    """Wishlist model"""
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='wishlist')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cart_wishlist'
        verbose_name = 'Wishlist'
        verbose_name_plural = 'Wishlists'
    
    def __str__(self):
        return f"Wishlist for {self.user.full_name}"
    
    @property
    def total_items(self):
        return self.items.count()

class WishlistItem(models.Model):
    """Wishlist Item model"""
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    added_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'cart_wishlist_item'
        verbose_name = 'Wishlist Item'
        verbose_name_plural = 'Wishlist Items'
        unique_together = ['wishlist', 'product']
    
    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.full_name}'s wishlist"
    
    def save(self, *args, **kwargs):
        # Update wishlist's updated_at when item is saved
        super().save(*args, **kwargs)
        self.wishlist.save()
