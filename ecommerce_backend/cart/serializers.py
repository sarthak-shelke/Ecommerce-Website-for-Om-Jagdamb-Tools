from rest_framework import serializers
from .models import Cart, CartItem, Wishlist, WishlistItem
from products.serializers import ProductListSerializer

class CartItemSerializer(serializers.ModelSerializer):
    """Cart item serializer"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    unit_price = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'unit_price', 
                 'total_price', 'added_at', 'updated_at']
        read_only_fields = ['id', 'added_at', 'updated_at']

class CartSerializer(serializers.ModelSerializer):
    """Cart serializer"""
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    is_empty = serializers.ReadOnlyField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_amount', 'is_empty', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AddToCartSerializer(serializers.Serializer):
    """Add to cart serializer"""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)

class UpdateCartItemSerializer(serializers.Serializer):
    """Update cart item serializer"""
    cart_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class WishlistItemSerializer(serializers.ModelSerializer):
    """Wishlist item serializer"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_id', 'added_at']
        read_only_fields = ['id', 'added_at']

class WishlistSerializer(serializers.ModelSerializer):
    """Wishlist serializer"""
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    
    class Meta:
        model = Wishlist
        fields = ['id', 'items', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
