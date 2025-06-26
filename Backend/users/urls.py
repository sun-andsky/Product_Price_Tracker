from django.urls import path
from .views import DeleteUserView, SignupView, LoginView, UserList, LogoutView, UserProfileView, WishlistView,AddToWishlistView, RemoveFromWishlistView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('', UserList.as_view(), name='user-list'),
    path("wishlist/", WishlistView.as_view(), name="wishlist"),
    path("wishlist/add/", AddToWishlistView.as_view(), name="wishlist-add"),
    path("wishlist/remove/", RemoveFromWishlistView.as_view(), name="wishlist-remove"),
    path('profile/', UserProfileView.as_view()),
    path('delete/', DeleteUserView.as_view(), name='user-delete'),
]

