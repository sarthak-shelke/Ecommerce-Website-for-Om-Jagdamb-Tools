from django.contrib import admin
from .models import Category, Product, ProductImage, ProductReview, ProductSpecification

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Category admin"""
    list_display = ['name', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']

class ProductImageInline(admin.TabularInline):
    """Product image inline"""
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary', 'order']

class ProductSpecificationInline(admin.TabularInline):
    """Product specification inline"""
    model = ProductSpecification
    extra = 1
    fields = ['name', 'value', 'order']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Product admin"""
    list_display = ['name', 'category', 'sku', 'price', 'stock_quantity', 'is_active', 'is_featured', 'created_at']
    list_filter = ['category', 'is_active', 'is_featured', 'brand', 'created_at']
    search_fields = ['name', 'sku', 'description', 'brand']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['-created_at']
    inlines = [ProductImageInline, ProductSpecificationInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'short_description', 'category')
        }),
        ('Product Details', {
            'fields': ('sku', 'price', 'original_price', 'brand', 'model_number', 'warranty_period')
        }),
        ('Inventory', {
            'fields': ('stock_quantity', 'min_stock_level', 'weight', 'dimensions')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    """Product review admin"""
    list_display = ['product', 'user', 'rating', 'title', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_approved', 'created_at']
    search_fields = ['product__name', 'user__email', 'title', 'comment']
    ordering = ['-created_at']
    actions = ['approve_reviews', 'disapprove_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"
    
    def disapprove_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    disapprove_reviews.short_description = "Disapprove selected reviews"
