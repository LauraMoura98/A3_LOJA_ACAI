# Generated by Django 4.2.16 on 2024-11-17 14:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_rest', '0009_produto_acrescimos'),
    ]

    operations = [
        migrations.AddField(
            model_name='produto',
            name='tamanho',
            field=models.ManyToManyField(related_name='produtos', through='api_rest.TamanhoProduto', to='api_rest.tamanho'),
        ),
    ]
