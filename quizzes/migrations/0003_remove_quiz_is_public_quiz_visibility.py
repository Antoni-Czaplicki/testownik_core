# Generated by Django 5.1.1 on 2024-09-16 11:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("quizzes", "0002_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="quiz",
            name="is_public",
        ),
        migrations.AddField(
            model_name="quiz",
            name="visibility",
            field=models.PositiveIntegerField(
                choices=[
                    (0, "Prywatny"),
                    (1, "Dla udostępnionych"),
                    (2, "Niepubliczny (z linkiem)"),
                    (3, "Publiczny"),
                ],
                default=0,
            ),
        ),
    ]
