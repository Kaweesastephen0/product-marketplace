from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("businesses", "0002_business_owner"),
    ]

    operations = [
        migrations.CreateModel(
            name="Product",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("price", models.DecimalField(decimal_places=2, max_digits=12)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Draft"),
                            ("pending_approval", "Pending Approval"),
                            ("approved", "Approved"),
                        ],
                        db_index=True,
                        default="draft",
                        max_length=32,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "business",
                    models.ForeignKey(
                        db_index=True,
                        on_delete=models.deletion.CASCADE,
                        related_name="products",
                        to="businesses.business",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=models.deletion.PROTECT,
                        related_name="products_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["business", "status"], name="products_pro_busines_8e96b8_idx"),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["status"], name="products_pro_status_a3ece4_idx"),
        ),
    ]
