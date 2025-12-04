from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory, Coupon
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for Order Items"""
    product_name = serializers.CharField(read_only=True)
    product_sku = serializers.CharField(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    order_number = serializers.CharField(read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'order_number', 'user', 'status', 'payment_status',
            'subtotal', 'tax_amount', 'shipping_cost', 'discount_amount', 'total_amount',
            'shipping_address', 'billing_address', 'notes', 'tracking_number',
            'estimated_delivery', 'delivered_at', 'created_at', 'updated_at',
            'items', 'total_items'
        ]
        read_only_fields = ['id', 'order_id', 'user', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating orders from frontend"""
    # Order items
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    # Pricing
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Addresses
    shipping_address = serializers.JSONField()
    billing_address = serializers.JSONField(required=False, allow_null=True)
    
    # Payment
    payment_method = serializers.CharField(max_length=20)
    payment_details = serializers.JSONField(required=False, allow_null=True)
    
    # Additional
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    user_email = serializers.EmailField(required=False)
    
    def validate_items(self, value):
        """Validate order items"""
        if not value or len(value) == 0:
            raise serializers.ValidationError("Order must contain at least one item")
        
        for item in value:
            if 'product_id' not in item:
                raise serializers.ValidationError("Each item must have a product_id")
            if 'quantity' not in item or item['quantity'] < 1:
                raise serializers.ValidationError("Each item must have a valid quantity")
        
        return value
    
    def validate_shipping_address(self, value):
        """Validate shipping address"""
        required_fields = ['full_name', 'phone', 'address_line1', 'city', 'state', 'pincode']
        for field in required_fields:
            if field not in value or not value[field]:
                raise serializers.ValidationError(f"Shipping address must include {field}")
        return value
    
    def create(self, validated_data):
        """Create order and order items"""
        items_data = validated_data.pop('items')
        payment_method = validated_data.pop('payment_method', 'cod')
        payment_details = validated_data.pop('payment_details', None)
        user_email = validated_data.pop('user_email', None)
        
        # Get user from request
        user = self.context['request'].user
        
        # Create order
        order = Order.objects.create(
            user=user,
            **validated_data
        )
        
        # Create order items
        for item_data in items_data:
            try:
                product = Product.objects.get(id=item_data['product_id'], is_active=True)
                
                # Check stock
                if product.stock_quantity < item_data['quantity']:
                    raise serializers.ValidationError(
                        f"Insufficient stock for {product.name}. Available: {product.stock_quantity}"
                    )
                
                # Create order item
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=item_data.get('product_name', product.name),
                    product_sku=item_data.get('product_sku', product.slug),
                    quantity=item_data['quantity'],
                    unit_price=item_data.get('unit_price', product.price),
                    total_price=item_data.get('total_price', product.price * item_data['quantity'])
                )
                
                # Reduce stock
                product.stock_quantity -= item_data['quantity']
                product.save()
                
            except Product.DoesNotExist:
                order.delete()  # Rollback order creation
                raise serializers.ValidationError(f"Product with ID {item_data['product_id']} not found")
        
        # Create payment record
        from payments.models import Payment
        Payment.objects.create(
            order=order,
            payment_method=payment_method,
            amount=order.total_amount,
            status='pending' if payment_method != 'cod' else 'completed',
            gateway_response=payment_details
        )
        
        # Update order payment status
        if payment_method == 'cod':
            order.payment_status = 'pending'  # Will be paid on delivery
        else:
            order.payment_status = 'pending'  # Waiting for payment confirmation
        
        order.status = 'confirmed'
        order.save()
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status='confirmed',
            notes='Order placed successfully',
            created_by=user
        )
        
        return order


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for Order Status History"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'order', 'status', 'notes', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for Coupons"""
    is_valid_now = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'name', 'description', 'discount_type', 'discount_value',
            'minimum_order_amount', 'maximum_discount_amount', 'usage_limit',
            'used_count', 'is_active', 'valid_from', 'valid_until', 'is_valid_now'
        ]
        read_only_fields = ['id', 'used_count']
    
    def get_is_valid_now(self, obj):
        return obj.is_valid()
