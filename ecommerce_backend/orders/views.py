from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem, OrderStatusHistory, Coupon
from .serializers import (
    OrderSerializer, CreateOrderSerializer, OrderItemSerializer,
    OrderStatusHistorySerializer, CouponSerializer
)


class CreateOrderView(generics.CreateAPIView):
    """Create a new order"""
    serializer_class = CreateOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Return order details
        order_serializer = OrderSerializer(order)
        return Response({
            'message': 'Order created successfully',
            'order_id': str(order.order_id),
            'order_number': order.order_number,
            'order': order_serializer.data
        }, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """List user's orders"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_id'
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class CancelOrderView(generics.UpdateAPIView):
    """Cancel an order"""
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response(
                {'error': 'order_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order = get_object_or_404(Order, order_id=order_id, user=request.user)
        
        if not order.can_be_cancelled():
            return Response(
                {'error': f'Order cannot be cancelled. Current status: {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancel order
        order.status = 'cancelled'
        order.save()
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status='cancelled',
            notes='Cancelled by user',
            created_by=request.user
        )
        
        # Restore stock
        for item in order.items.all():
            item.product.stock_quantity += item.quantity
            item.product.save()
        
        return Response({
            'message': 'Order cancelled successfully',
            'order': OrderSerializer(order).data
        })


class OrderStatusHistoryView(generics.ListAPIView):
    """Get order status history"""
    serializer_class = OrderStatusHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        order_id = self.kwargs.get('order_id')
        return OrderStatusHistory.objects.filter(
            order__order_id=order_id,
            order__user=self.request.user
        )


class ValidateCouponView(generics.GenericAPIView):
    """Validate and apply coupon"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        order_amount = request.data.get('order_amount', 0)
        
        if not code:
            return Response(
                {'error': 'Coupon code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            coupon = Coupon.objects.get(code=code.upper())
        except Coupon.DoesNotExist:
            return Response(
                {'error': 'Invalid coupon code'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not coupon.is_valid():
            return Response(
                {'error': 'Coupon is not valid or has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        discount = coupon.calculate_discount(float(order_amount))
        
        return Response({
            'valid': True,
            'coupon': CouponSerializer(coupon).data,
            'discount_amount': discount,
            'final_amount': float(order_amount) - discount
        })
