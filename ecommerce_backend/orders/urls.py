from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'orders', views.OrderViewSet)
router.register(r'coupons', views.CouponViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('validate-coupon/', views.ValidateCouponView.as_view(), name='validate_coupon'),
    path('order-history/', views.OrderHistoryView.as_view(), name='order_history'),
]
