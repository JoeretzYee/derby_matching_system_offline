# Generated by Django 5.1.5 on 2025-01-20 02:00

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('when', models.DateField()),
                ('givenTake', models.IntegerField()),
            ],
        ),
    ]
