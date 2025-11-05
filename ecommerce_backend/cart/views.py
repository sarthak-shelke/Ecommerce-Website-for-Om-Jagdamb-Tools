from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Wishlist, WishlistItem
from products.models import Product
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer,
    UpdateCartItemSerializer, WishlistSerializer, WishlistItemSerializer
)

class CartView(generics.RetrieveAPIView):
    """Get user's cart"""
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

class AddToCartView(generics.CreateAPIView):
    """Add item to cart"""
    serializer_class = AddToCartSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        
        # Get or create cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Get product
        product = get_object_or_404(Product, id=product_id, is_active=True)
        
        # Check stock
        if product.stock_quantity < quantity:
            return Response(
                {'error': 'Insufficient stock'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add or update cart item
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            new_quantity = cart_item.quantity + quantity
            if product.stock_quantity < new_quantity:
                return Response(
                    {'error': 'Insufficient stock'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = new_quantity
            cart_item.save()
        
        return Response({
            'message': 'Item added to cart',
            'cart_item': CartItemSerializer(cart_item).data
        }, status=status.HTTP_201_CREATED)

class UpdateCartItemView(generics.UpdateAPIView):
    """Update cart item quantity"""
    serializer_class = UpdateCartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cart_item_id = serializer.validated_data['cart_item_id']
        quantity = serializer.validated_data['quantity']
        
        # Get cart item
        cart_item = get_object_or_404(
            CartItem, 
            id=cart_item_id, 
            cart__user=request.user
        )
        
        # Check stock
        if cart_item.product.stock_quantity < quantity:
            return Response(
                {'error': 'Insufficient stock'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart_item.quantity = quantity
        cart_item.save()
        
        return Response({
            'message': 'Cart item updated',
            'cart_item': CartItemSerializer(cart_item).data
        })

class RemoveFromCartView(generics.DestroyAPIView):
    """Remove item from cart"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        cart_item_id = request.data.get('cart_item_id')
        
        if not cart_item_id:
            return Response(
                {'error': 'cart_item_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart_item = get_object_or_404(
            CartItem, 
            id=cart_item_id, 
            cart__user=request.user
        )
        
        cart_item.delete()
        
        return Response({'message': 'Item removed from cart'})

class ClearCartView(generics.DestroyAPIView):
    """Clear all items from cart"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
            return Response({'message': 'Cart cleared'})
        except Cart.DoesNotExist:
            return Response({'message': 'Cart is already empty'})

class WishlistViewSet(viewsets.ModelViewSet):
    """Wishlist viewset"""
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist.items.all()
    
    def create(self, request, *args, **kwargs):
        """Add item to wishlist"""
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create wishlist
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        # Get product
        product = get_object_or_404(Product, id=product_id, is_active=True)
        
        # Add to wishlist (or get existing)
        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist, 
            product=product
        )
        
        if created:
            return Response({
                'message': 'Item added to wishlist',
                'wishlist_item': WishlistItemSerializer(wishlist_item).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Item already in wishlist',
                'wishlist_item': WishlistItemSerializer(wishlist_item).data
            })
    
    def destroy(self, request, *args, **kwargs):
        """Remove item from wishlist"""
        wishlist_item = self.get_object()
        wishlist_item.delete()
        return Response({'message': 'Item removed from wishlist'})
    
    @action(detail=False, methods=['get'])
    def list_wishlist(self, request):
        """Get user's complete wishlist"""
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear_wishlist(self, request):
        """Clear all items from wishlist"""
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            wishlist.items.all().delete()
            return Response({'message': 'Wishlist cleared'})
        except Wishlist.DoesNotExist:
            return Response({'message': 'Wishlist is already empty'})
