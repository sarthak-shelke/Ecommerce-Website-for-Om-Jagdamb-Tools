from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views  # Or use 'api_views' if that's the real name of your views file

# This is the standard way to use ViewSets
router = DefaultRouter()

# This tells the router to use your ViewSets
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'', views.ProductViewSet, basename='product') 

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]
