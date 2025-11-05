from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory, Coupon
from products.serializers import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    """Order item serializer"""
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 
                 'quantity', 'unit_price', 'total_price']

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Order status history serializer"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'notes', 'created_by_name', 'created_at']

class OrderListSerializer(serializers.ModelSerializer):
    """Order list serializer"""
    order_number = serializers.ReadOnlyField()
    total_items = serializers.ReadOnlyField()
    
    class Meta:
        model = Order
        fields = ['id', 'order_id', 'order_number', 'status', 'payment_status',
                 'total_amount', 'total_items', 'created_at', 'updated_at']

class OrderDetailSerializer(serializers.ModelSerializer):
    """Order detail serializer"""
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    order_number = serializers.ReadOnlyField()
    total_items = serializers.ReadOnlyField()
    
    class Meta:
        model = Order
        fields = ['id', 'order_id', 'order_number', 'status', 'payment_status',
                 'subtotal', 'tax_amount', 'shipping_cost', 'discount_amount',
                 'total_amount', 'shipping_address', 'billing_address',
                 'notes', 'tracking_number', 'estimated_delivery', 'delivered_at',
                 'items', 'status_history', 'total_items', 'created_at', 'updated_at']

class CheckoutSerializer(serializers.Serializer):
    """Checkout serializer"""
    shipping_address = serializers.JSONField()
    billing_address = serializers.JSONField(required=False)
    payment_method = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True)

class CouponSerializer(serializers.ModelSerializer):
    """Coupon serializer"""
    is_valid_now = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'name', 'description', 'discount_type',
                 'discount_value', 'minimum_order_amount', 'maximum_discount_amount',
                 'usage_limit', 'used_count', 'is_active', 'valid_from',
                 'valid_until', 'is_valid_now']
        read_only_fields = ['id', 'used_count']
    
    def get_is_valid_now(self, obj):
        return obj.is_valid()

class ValidateCouponSerializer(serializers.Serializer):
    """Validate coupon serializer"""
    coupon_code = serializers.CharField()
    order_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
