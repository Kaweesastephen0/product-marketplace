import factory

from businesses.models import Business


class BusinessFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Business

    name = factory.Sequence(lambda n: f"Business {n}")
    owner = None
