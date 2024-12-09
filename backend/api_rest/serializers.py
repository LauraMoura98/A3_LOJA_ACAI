from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import Group

from .models.produto import Produto
from .models.categoria import Categoria
from .models.acrescimos import Acrescimos
from .models.tamanho import Tamanho
from .models.tamanho_produto import TamanhoProduto
from .models.pedido import Pedido
from .models.item_pedido import ItemPedido


class ProdutoSerializer(serializers.ModelSerializer):
    categoria = serializers.SlugRelatedField(
        slug_field='nome',
        queryset=Categoria.objects.all()
    )
    acrescimos = serializers.SlugRelatedField(
        slug_field='nome',
        queryset=Acrescimos.objects.filter(disponivel=True),
        many=True
    )

    class Meta:
        model = Produto
        fields = [
            'id',
            'nome',
            'descricao',
            'disponibilidade',
            'imagem_url',
            'categoria',
            'acrescimos',
        ]


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class AcrescimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acrescimos
        fields = '__all__'


class TamanhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tamanho
        fields = '__all__'


class TamanhoProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TamanhoProduto
        fields = '__all__'


User = get_user_model()


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        user_group, created = Group.objects.get_or_create(name='site_users')
        user.groups.add(user_group)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        return data


class ItemPedidoSerializer(serializers.ModelSerializer):
    produto = serializers.CharField(required=True)  # Nome do produto obrigatório
    tamanho = serializers.CharField(required=False, allow_null=True)  # Nome do tamanho
    acrescimos = serializers.ListField(child=serializers.CharField(), required=False)  # Lista de nomes de acrescimos

    class Meta:
        model = ItemPedido
        fields = ['produto', 'tamanho', 'acrescimos']


class PedidoSerializer(serializers.ModelSerializer):
    itens_pedido = ItemPedidoSerializer(many=True)
    senha = serializers.CharField(read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'status', 'data_criacao', 'data_atualizacao', 'senha', 'itens_pedido']
        read_only_fields = ['data_criacao', 'data_atualizacao', 'senha']

    def create(self, validated_data):
        # Dados de itens no pedido
        itens_pedido_data = validated_data.pop('itens_pedido', [])
        user = self.context['request'].user  # Capturar o usuário autenticado

        # Remover o campo 'cliente' de validated_data, se existir
        validated_data.pop('cliente', None)

        # Buscar ou criar um pedido existente
        pedido_existente = Pedido.objects.filter(cliente=user, status='PENDENTE').first()
        if not pedido_existente:
            pedido_existente = Pedido.objects.create(cliente=user, **validated_data)

        # Criar os itens do pedido
        for item_data in itens_pedido_data:
            try:
                # Validando se o produto realmente existe no banco
                produto_nome = item_data.get("produto")
                produto = Produto.objects.filter(nome=produto_nome).first()
                if not produto:
                    raise serializers.ValidationError({"error": f"Produto '{produto_nome}' não existe no banco de dados."})

                # Buscar o tamanho pelo nome, se existir
                tamanho_nome = item_data.get("tamanho")
                tamanho = Tamanho.objects.filter(nome=tamanho_nome).first() if tamanho_nome else None

                # Buscar os acrescimos
                acrescimos_nomes = item_data.get('acrescimos', [])
                acrescimos = Acrescimos.objects.filter(nome__in=acrescimos_nomes)

                # Criar o item do pedido
                item_pedido = ItemPedido.objects.create(
                    pedido=pedido_existente,
                    produto=produto,
                    tamanho=tamanho,
                )
                # Associar os acrescimos
                item_pedido.acrescimos.set(acrescimos)

            except Exception as e:
                raise serializers.ValidationError({"error": f"Erro ao processar item: {str(e)}"})

        return pedido_existente
