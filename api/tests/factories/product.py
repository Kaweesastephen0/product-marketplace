import factory

from products.models import Product, ProductStatus
from tests.factories.business import BusinessFactory
from tests.factories.user import UserFactory


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product

    name = factory.Sequence(lambda n: f"Product {n}")
    description = "A test product"
    price = "19.99"
    status = ProductStatus.DRAFT
    business = factory.SubFactory(BusinessFactory)
    created_by = factory.SubFactory(UserFactory, business=factory.SelfAttribute("..business"))
