from mongoengine import Document, StringField, DateTimeField, ListField, DictField, IntField, EmbeddedDocument, EmbeddedDocumentField


class PricePoint(EmbeddedDocument):
    Timestamp = DateTimeField(required=True)
    Price = IntField(required=True)

class Product(Document):
    Category = StringField()
    Product_Name = StringField()
    Memory = StringField()
    Price = StringField()
    Ratings = StringField()
    Reviews = StringField()
    Links = StringField()
    Image = StringField()
    Source = StringField()
    Timestamp = DateTimeField()
    Price_History = ListField(EmbeddedDocumentField(PricePoint))
    Latest_Price = StringField()

    meta = {'collection': 'product_info'}


