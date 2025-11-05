from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'payment-methods', views.PaymentMethodViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create-payment-intent/', views.CreatePaymentIntentView.as_view(), name='create_payment_intent'),
    path('confirm-payment/', views.ConfirmPaymentView.as_view(), name='confirm_payment'),
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe_webhook'),
    path('refund/', views.RefundView.as_view(), name='refund'),
]
