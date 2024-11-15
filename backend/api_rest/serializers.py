from rest_framework import serializers
from .models.produto import Produto
from .models.categoria import Categoria
from .models.acrescimos import Acrescimos


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'

    def valida_acrescimos(self, value):
        """
        Valida que os nomes dos acréscimos existem no banco de dados e retorna os objetos
        correspondentes.
        """
        acr_items = []
        for nome in value:
            try:
                acrescimo = Acrescimos.objects.get(nome=nome, disponivel=True)
                acr_items.append(acrescimo)
            except Acrescimos.DoesNotExist:
                raise serializers.ValidationError(f"Acréscimo '{nome}' não encontrado ou não disponível.")
        return acr_items

    def valida_categorias(self, value):
        """
        Valida que os nomes das Categorias existem no banco de dados e retorna os objetos
        correspondentes.
        """
        cat_items = []
        for nome in value:
            try:
                categorias = Categoria.objects.get(nome=nome, disponivel=True)
                cat_items.append(categorias)
            except Categoria.DoesNotExist:
                raise serializers.ValidationError(f"Acréscimo '{nome}' não encontrado ou não disponível.")
        return cat_items


class CategoriaSerializer(serializers.ModelSerializer):
    produtos = serializers.SlugRelatedField(slug_field='nome', queryset=Produto.objects.all())

    class Meta:
        model = Categoria
        fields = '__all__'


class AcrescimoSerializer(serializers.ModelSerializer):
    acrescimos = serializers.SlugRelatedField(slug_field='nome', queryset=Acrescimos.objects.all())

    class Meta:
        model = Acrescimos
        fields = '__all__'
