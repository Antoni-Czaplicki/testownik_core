# Generated by Django 5.1.4 on 2025-01-15 16:32

import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("quizzes", "0005_alter_quizprogress_study_time"),
    ]

    operations = [
        migrations.AlterField(
            model_name="sharedquiz",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
    ]