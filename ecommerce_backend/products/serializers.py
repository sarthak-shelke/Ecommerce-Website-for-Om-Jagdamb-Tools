from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductReview, ProductSpecification

class CategorySerializer(serializers.ModelSerializer):
    """Category serializer"""
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 
                 'is_active', 'products_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()

class ProductImageSerializer(serializers.ModelSerializer):
    """Product image serializer"""
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    """Product specification serializer"""
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value', 'order']

class ProductReviewSerializer(serializers.ModelSerializer):
    """Product review serializer"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = ['id', 'user', 'user_name', 'rating', 'title', 'comment', 
                 'is_approved', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'is_approved', 'created_at', 'updated_at']

class ProductListSerializer(serializers.ModelSerializer):
    """Product list serializer (for listing products)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'short_description', 'category_name', 
                 'sku', 'price', 'original_price', 'discount_percentage',
                 'primary_image', 'average_rating', 'review_count', 
                 'is_in_stock', 'is_featured', 'created_at']
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    """Product detail serializer (for single product view)"""
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'short_description', 
                 'category', 'sku', 'price', 'original_price', 'discount_percentage',
                 'stock_quantity', 'weight', 'dimensions', 'brand', 'model_number',
                 'warranty_period', 'images', 'specifications', 'reviews',
                 'average_rating', 'review_count', 'is_in_stock', 'is_low_stock',
                 'is_featured', 'meta_title', 'meta_description', 'created_at']

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Product create/update serializer"""
    class Meta:
        model = Product
        fields = ['name', 'description', 'short_description', 'category', 
                 'sku', 'price', 'original_price', 'stock_quantity', 
                 'min_stock_level', 'weight', 'dimensions', 'brand', 
                 'model_number', 'warranty_period', 'is_active', 'is_featured',
                 'meta_title', 'meta_description']
