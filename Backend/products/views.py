from django.http import JsonResponse
from django.views import View
from .mongo_models import Product
from rest_framework.views import APIView
from rest_framework.response import Response
from mongoengine.queryset.visitor import Q
from .serializers import ProductSerializer
from mongoengine import get_connection
from rest_framework import status
from bson import ObjectId

print("🧠 Connected to Mongo:", get_connection())
print("📦 Total products:", Product.objects.count())


class ProductList(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip().lower()
        category = request.GET.get('category', '').strip().lower()
        brand = request.GET.get('brand', '').strip().lower()

        filters = Q()
        if query:
            filters &= Q(Product_Name__icontains=query)

        if category:
            filters &= Q(Category__icontains=category)

        if brand:
            filters &= Q(Product_Name__icontains=brand)

        products = Product.objects.filter(filters)
        serialized = ProductSerializer(products, many=True)
        return Response(serialized.data)


import re


def extract_price(price_text):
    if not price_text:
        return None
    try:
        digits = re.sub(r"[^\d]", "", price_text)  # Removes ₹, commas, spaces, etc.
        return int(digits) if digits else None
    except:
        return None

class ProductSearchView(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip().lower()
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        sort = request.GET.get('sort')
        source = request.GET.get('source', '').strip().lower()
        category = request.GET.get('category', '').strip().lower()
        brand = request.GET.get('brand', '').strip().lower()

        filters = Q()
        if query:
            filters &= Q(Product_Name__icontains=query)

        if source:
            filters &= Q(Source__iexact=source)  # Case-insensitive exact match

        if category:
            filters &= Q(Category__icontains=category)

        if brand:
            filters &= Q(Product_Name__icontains=brand)

        raw_products = Product.objects.filter(filters)

        products = []
        for p in raw_products:
            price = extract_price(p.Latest_Price)
            if price is not None:
                products.append((p, price))
            else:
                print(f"⚠️ Skipping product due to invalid price: {p.Product_Name} | {p.Latest_Price}")

        if min_price:
            min_price = int(min_price)
            products = [(p, price) for p, price in products if price >= min_price]
        if max_price:
            max_price = int(max_price)
            products = [(p, price) for p, price in products if price <= max_price]

        if sort == 'price_asc':
            products.sort(key=lambda x: x[1])
        elif sort == 'price_desc':
            products.sort(key=lambda x: x[1], reverse=True)

        final_products = [p for p, _ in products]
        serializer = ProductSerializer(final_products, many=True)
        return JsonResponse(serializer.data, safe=False)



class SuggestionView(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({"suggestions": []}, status=status.HTTP_200_OK)

        suggestions = Product.objects.filter(Product_Name__icontains=query).only('Product_Name')[:5]
        unique_names = list({p.Product_Name for p in suggestions})
        return Response({"suggestions": unique_names}, status=status.HTTP_200_OK)


def get_product_detail(request, product_id):
    try:
        product = Product.objects.get(id=ObjectId(product_id))
        history = [
            {
                "timestamp": point.Timestamp.isoformat(),
                "price": point.Price
            }
            for point in product.Price_History
        ]

        # Calculate min and max prices
        try:
            prices = [
                float(str(entry['price']).replace('₹', '').replace(',', '').strip())
                for entry in history
                if 'price' in entry and entry['price']
            ]
            min_price = f"₹{int(min(prices)):,}"
            max_price = f"₹{int(max(prices)):,}"
        except Exception as e:
            print("⚠️ Price parsing error:", e)
            min_price = max_price = None

        # Recommendation logic
        try:
            current_price = float(str(product.Latest_Price).replace('₹', '').replace(',', '').strip())
            numeric_min_price = float(str(min_price).replace('₹', '').replace(',', '').strip())

            if current_price <= numeric_min_price:
                recommendation = "Great Deal ! Buy Now"
            elif current_price <= numeric_min_price * 1.05:
                recommendation = "Good price, consider buying"
            else:
                recommendation = "Wait for a better price"
        except Exception as e:
            print("⚠️ Recommendation error:", e)
            recommendation = "Price unavailable"

        data = {
            "id": str(product.id),
            "Product_Name": product.Product_Name,
            "Latest_Price": product.Latest_Price,
            "Ratings": product.Ratings,
            "Reviews": product.Reviews,
            "Links": product.Links,
            "Image": product.Image,
            "Source": product.Source,
            "Timestamp": product.Timestamp.isoformat() if product.Timestamp else None,
            "Price_History": history,
            "Min_Price": min_price,
            "Max_Price": max_price,
            "Recommendation": recommendation
        }

        return JsonResponse(data)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
