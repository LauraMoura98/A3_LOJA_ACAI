# Generated by Django 5.1.2 on 2024-10-27 17:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api_rest', '0003_acrescimos_categoria_tamanho_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='pedido',
            name='cliente',
        ),
        migrations.DeleteModel(
            name='Cliente',
        ),
    ]
