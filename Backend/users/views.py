from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import SignupSerializer, LoginSerializer, UserSerializer
from .models import User
from .auth import JWTAuthentication
from django.contrib.auth.hashers import make_password, check_password
import jwt
import datetime
from django.conf import settings
from django.db.models import Q
from rest_framework.exceptions import AuthenticationFailed
from products.mongo_models import Product  # <- Adjust if needed
from bson import ObjectId


SECRET_KEY = settings.SECRET_KEY


class SignupView(APIView):
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'POST':
            return []  # Public signup
        return [permissions.IsAuthenticated()]  # Auth required for GET

    def get(self, request):
        query = request.GET.get('q')
        users = User.objects.all()
        if query:
            users = users.filter(username__icontains=query) | users.filter(email__icontains=query)
            # MongoEngine doesn't support Q objects like Django ORM,
            # so separated filters and combined QuerySets using | operator.
        serializer = UserSerializer(users, many=True)
        return Response({"signed_up_users": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            # FIX: use count() > 0 instead of filter().exists()
            if User.objects(email=email).count() > 0:
                return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                user = User(
                    username=serializer.validated_data["username"],
                    email=email,
                    password=make_password(serializer.validated_data["password"])
                )
                user.save()
                return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = []  # Public login

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
                if check_password(serializer.validated_data['password'], user.password):
                    payload = {
                        "id": str(user.id),
                        "username": user.username,
                        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
                    }
                    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
                    return Response({"token": token, "expires_in": 7200}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Incorrect password"}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        # Optional: authenticated GET users
        self.check_permissions(request)
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response({"logged_in_users": serializer.data}, status=status.HTTP_200_OK)


class UserList(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q')
        sort = request.GET.get('sort', 'email')
        users = User.objects.all()
        if query:
            users = users.filter(username__icontains=query) | users.filter(email__icontains=query)
        # MongoEngine doesn't support order_by() like Django ORM;
        # if you want sorting, you should use `.order_by()` but note it works only on fields:
        users = users.order_by(sort)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({"message": "Logged out. Remove token on client."}, status=status.HTTP_200_OK)


class WishlistView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        try:
            products = Product.objects(id__in=user.wishlist)
            product_list = []
            for p in products:
                product_list.append({
                    "id": str(p.id),
                    "Product_Name": p.Product_Name,
                    "Image": p.Image,
                    "Latest_Price": p.Latest_Price,
                    "Links": p.Links,
                    "Source": p.Source,
                })
            return Response(product_list, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class AddToWishlistView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        product_id = request.data.get("product_id")
        if product_id and product_id not in user.wishlist:
            user.wishlist.append(product_id)
            user.save()
            return Response({"message": "Added to wishlist"}, status=200)
        return Response({"error": "Product ID missing or already in wishlist"}, status=400)

class RemoveFromWishlistView(APIView):
    authentication_classes = [JWTAuthentication]

    def delete(self, request):
        user = request.user
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({"error": "Product ID missing"}, status=400)
        if product_id in user.wishlist:
            user.wishlist.remove(product_id)
            user.save()
            return Response({"message": "Removed from wishlist"}, status=200)
        return Response({"error": "Product not found in wishlist"}, status=400)
    

class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "password": "********",  # masked
            "date_joined": user.date_joined,
        })
    
class DeleteUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"message": "User deleted."}, status=204)
