from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Product, Category
from .serializers import ProductListSerializer, CategorySerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def products_list(request):
    """Simple products list API"""
    products = Product.objects.filter(is_active=True)[:10]
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response({
        'products': serializer.data,
        'count': products.count()
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def categories_list(request):
    """Simple categories list API"""
    categories = Category.objects.filter(is_active=True)
    serializer = CategorySerializer(categories, many=True)
    return Response({
        'categories': serializer.data,
        'count': categories.count()
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    """Featured products API"""
    products = Product.objects.filter(is_active=True, is_featured=True)
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response({
        'products': serializer.data,
        'count': products.count()
    })
