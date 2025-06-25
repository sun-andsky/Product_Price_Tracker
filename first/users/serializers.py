# serializers.py
from rest_framework import serializers
from .models import User

class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError("Email already registered")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.Serializer):  # ✅ NOT ModelSerializer!
    id = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()
