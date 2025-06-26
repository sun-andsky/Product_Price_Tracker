import datetime  # ✅ Correct full module import
from mongoengine import ListField, StringField, EmailField, DateTimeField, Document
from products.mongo_models import Product  # Ensure Product model is defined correctly


class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    wishlist = ListField(StringField())  # storing product IDs as strings
    date_joined = DateTimeField(default=datetime.datetime.utcnow)  # ✅ Fix here

    meta = {
        'collection': 'user_data',
        'db_alias': 'default'
    }

    @property
    def is_authenticated(self):
        return True
