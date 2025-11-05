from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_verified', 'is_active', 'created_at']
    list_filter = ['is_verified', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name', 'phone_number']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone_number', 'date_of_birth', 'profile_picture', 'is_verified')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'first_name', 'last_name', 'phone_number')
        }),
    )

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """Address admin"""
    list_display = ['user', 'address_type', 'city', 'state', 'country', 'is_default', 'created_at']
    list_filter = ['address_type', 'country', 'state', 'is_default', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'city', 'state']
    ordering = ['-created_at']
