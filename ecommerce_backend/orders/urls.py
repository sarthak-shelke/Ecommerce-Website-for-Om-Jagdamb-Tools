from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreateOrderView.as_view(), name='create_order'),
    path('', views.OrderListView.as_view(), name='order_list'),
    path('<uuid:order_id>/', views.OrderDetailView.as_view(), name='order_detail'),
    path('cancel/', views.CancelOrderView.as_view(), name='cancel_order'),
    path('<uuid:order_id>/history/', views.OrderStatusHistoryView.as_view(), name='order_history'),
    path('coupon/validate/', views.ValidateCouponView.as_view(), name='validate_coupon'),
]
