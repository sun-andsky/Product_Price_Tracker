"""
URL configuration for first project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.http import HttpResponse  # 👈 Import this
from django.contrib import admin
from django.urls import path, include


def home(request):  # 👈 Define the function
    return HttpResponse("Backend is running!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
        path('', home),  # 👈 Add this line to handle `/`
    path('api/', include('products.urls')),  # ✅ include ALL product routes from one place
]
