# Generated by Django 4.2.16 on 2024-11-15 16:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_rest', '0008_acrescimos_disponivel'),
    ]

    operations = [
        migrations.AddField(
            model_name='produto',
            name='acrescimos',
            field=models.ManyToManyField(blank=True, related_name='produtos', to='api_rest.acrescimos'),
        ),
    ]
