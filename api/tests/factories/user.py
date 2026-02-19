import factory
from django.contrib.auth import get_user_model

from accounts.constants import Roles
from accounts.models import Role
from tests.factories.business import BusinessFactory

User = get_user_model()


# Returns an existing role by code or creates it with the default display name.
def get_role(code):
    name = dict(Roles.CHOICES)[code]
    role, _ = Role.objects.get_or_create(code=code, defaults={"name": name})
    return role


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    username = factory.LazyAttribute(lambda obj: obj.email)
    business = factory.SubFactory(BusinessFactory)
    role = factory.LazyFunction(lambda: get_role(Roles.VIEWER))
    is_active = True

    @factory.post_generation
    # Hashes and stores password on the created user, using default test password when omitted.
    def password(obj, create, extracted, **kwargs):
        raw_password = extracted or "Passw0rd!"
        obj.set_password(raw_password)
        if create:
            obj.save(update_fields=["password"])
