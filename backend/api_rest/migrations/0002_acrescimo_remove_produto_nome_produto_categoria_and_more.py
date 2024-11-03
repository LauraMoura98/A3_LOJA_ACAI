# Generated by Django 5.1.2 on 2024-10-25 00:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_rest', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Acrescimo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome_acrescimo', models.CharField(max_length=100, unique=True, verbose_name='Nome do Acrescimo')),
                ('disponivel', models.BooleanField(default=True, verbose_name='Disponível')),
            ],
        ),
        migrations.RemoveField(
            model_name='produto',
            name='nome',
        ),
        migrations.AddField(
            model_name='produto',
            name='categoria',
            field=models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='Categoria'),
        ),
        migrations.AddField(
            model_name='produto',
            name='disponivel',
            field=models.BooleanField(default=True, verbose_name='Disponível'),
        ),
        migrations.AddField(
            model_name='produto',
            name='imagem_url',
            field=models.CharField(blank=True, default='', max_length=255, null=True, verbose_name='Imagem URL'),
        ),
        migrations.AddField(
            model_name='produto',
            name='nome_produto',
            field=models.CharField(default='', max_length=255, unique=True, verbose_name='Nome do Produto'),
        ),
        migrations.AddField(
            model_name='produto',
            name='tamanho',
            field=models.CharField(blank=True, default='', max_length=50, null=True, verbose_name='Tamanho'),
        ),
        migrations.AlterField(
            model_name='produto',
            name='descricao',
            field=models.TextField(blank=True, null=True, verbose_name='Descrição'),
        ),
        migrations.AlterField(
            model_name='produto',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='produto',
            name='preco',
            field=models.DecimalField(decimal_places=2, max_digits=5, verbose_name='Preço'),
        ),
        migrations.AddField(
            model_name='produto',
            name='acrescimos',
            field=models.ManyToManyField(blank=True, to='api_rest.acrescimo', verbose_name='Acrescimos'),
        ),
    ]