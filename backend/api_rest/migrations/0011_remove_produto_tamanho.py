# Generated by Django 4.2.16 on 2024-11-17 14:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api_rest', '0010_produto_tamanho'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='produto',
            name='tamanho',
        ),
    ]