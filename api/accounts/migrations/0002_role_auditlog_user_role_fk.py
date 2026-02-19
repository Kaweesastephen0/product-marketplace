import django.db.models.deletion
from django.db import migrations, models


ROLE_SEED = [
    ("admin", "Admin"),
    ("business_owner", "Business Owner"),
    ("editor", "Editor"),
    ("approver", "Approver"),
    ("viewer", "Viewer"),
]


# Seeds the Role table with the predefined role code/name pairs.
def seed_roles(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    for code, name in ROLE_SEED:
        Role.objects.get_or_create(code=code, defaults={"name": name})


# Migrates legacy string role values on users to the new role foreign key.
def map_legacy_roles(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Role = apps.get_model("accounts", "Role")

    role_map = {role.code: role for role in Role.objects.all()}
    default_role = role_map["viewer"]

    for user in User.objects.all().only("id", "role"):
        legacy_role = getattr(user, "role", None)
        user.role_fk = role_map.get(legacy_role, default_role)
        user.save(update_fields=["role_fk"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("businesses", "0002_business_owner"),
    ]

    operations = [
        migrations.CreateModel(
            name="Role",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "code",
                    models.CharField(
                        choices=[
                            ("admin", "Admin"),
                            ("business_owner", "Business Owner"),
                            ("editor", "Editor"),
                            ("approver", "Approver"),
                            ("viewer", "Viewer"),
                        ],
                        max_length=32,
                        unique=True,
                    ),
                ),
                ("name", models.CharField(max_length=64)),
                ("description", models.CharField(blank=True, max_length=255)),
            ],
            options={"ordering": ["code"]},
        ),
        migrations.RunPython(seed_roles, migrations.RunPython.noop),
        migrations.AddField(
            model_name="user",
            name="role_fk",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="users",
                to="accounts.role",
            ),
        ),
        migrations.RunPython(map_legacy_roles, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="user",
            name="role",
        ),
        migrations.RenameField(
            model_name="user",
            old_name="role_fk",
            new_name="role",
        ),
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="users", to="accounts.role"),
        ),
        migrations.CreateModel(
            name="AuditLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(db_index=True, max_length=64)),
                ("target_type", models.CharField(max_length=64)),
                ("target_id", models.CharField(max_length=64)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="audit_logs",
                        to="accounts.user",
                    ),
                ),
                (
                    "business",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="audit_logs",
                        to="businesses.business",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["business", "action"], name="accounts_au_busines_50b2d2_idx"),
                    models.Index(fields=["target_type", "target_id"], name="accounts_au_target__2daa4e_idx"),
                ],
            },
        ),
        migrations.RemoveConstraint(
            model_name="user",
            name="accounts_user_business_required_for_non_superuser",
        ),
    ]
