from rest_framework import serializers
from .mongo_models import Product

class ProductSerializer(serializers.Serializer):
    id = serializers.CharField()
    Product_Name = serializers.CharField()
    Latest_Price = serializers.CharField()
    Ratings = serializers.CharField()
    Reviews = serializers.CharField()
    Links = serializers.URLField()
    Image = serializers.URLField()
    Source = serializers.CharField()
    Timestamp = serializers.DateTimeField()
    Price_History = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()
    recommendation = serializers.SerializerMethodField()


    def get_Price_History(self, obj):
        # Convert PricePoint objects to dictionaries for JSON serialization
        return [
            {
                "timestamp": point.Timestamp.isoformat() if point.Timestamp else None,
                "price": point.Price
            }
            for point in obj.Price_History
        ]

    def get_min_price(self, obj):
        prices = self._clean_history_prices(obj)
        return min(prices) if prices else None

    def get_max_price(self, obj):
        prices = self._clean_history_prices(obj)
        return max(prices) if prices else None

    def get_recommendation(self, obj):
        prices = self._clean_history_prices(obj)
        if not prices or len(prices) < 2:
            return "Not enough data"
        if prices[-1] <= min(prices):
            return "Good time to buy"
        else:
            return "Wait for a better price"

    def _clean_history_prices(self, obj):
        # Extract clean numeric prices from Price_History
        prices = []
        if hasattr(obj, 'Price_History'):
            for entry in obj.Price_History:
                price_str = getattr(entry, 'price', '') or getattr(entry, 'Price', '')
                if price_str:
                    try:
                        prices.append(int(price_str.replace(',', '').strip()))
                    except:
                        continue
        return prices


    