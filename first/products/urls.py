from django.urls import path
from products.views import ProductList, ProductSearchView, SuggestionView, get_product_detail

urlpatterns = [
    path('products/', ProductList.as_view(), name='product-list'),
    path('search/', ProductSearchView.as_view(), name='product-search'),
    path('suggestions/', SuggestionView.as_view(), name='product-suggestions'),
    path('product/<str:product_id>/', get_product_detail, name='product-detail'),  # ✅ make it specific!
]
