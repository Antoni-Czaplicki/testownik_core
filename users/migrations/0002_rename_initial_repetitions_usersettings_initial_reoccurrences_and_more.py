# Generated by Django 5.1.4 on 2025-01-19 18:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="usersettings",
            old_name="initial_repetitions",
            new_name="initial_reoccurrences",
        ),
        migrations.RenameField(
            model_name="usersettings",
            old_name="wrong_answer_repetitions",
            new_name="wrong_answer_reoccurrences",
        ),
    ]
