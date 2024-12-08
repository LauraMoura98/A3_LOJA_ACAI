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
        User.groups.add(user_group)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        return data


class ItemPedidoSerializer(serializers.ModelSerializer):
    produto = serializers.StringRelatedField()
    tamanho = serializers.StringRelatedField(allow_null=True)
    acrescimos = serializers.StringRelatedField(many=True)

    id_produto = serializers.IntegerField(write_only=True)
    tamanho_produto = serializers.CharField(write_only=True, required=False, allow_null=True)
    acrescimos = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = ItemPedido
        fields = ['produto', 'tamanho', 'acrescimos', 'id_produto', 'tamanho_produto']

    def validate(self, data):
        if 'id_produto' not in data:
            raise serializers.ValidationError({"id_produto": "Este campo é obrigatório."})
        return data

class PedidoSerializer(serializers.ModelSerializer):
    itens_pedido = ItemPedidoSerializer(many=True)
    senha = serializers.CharField(read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'status', 'data_criacao', 'data_atualizacao', 'senha', 'itens_pedido']
        read_only_fields = ['data_criacao', 'data_atualizacao', 'senha']

    def create(self, validated_data):
        # Obtém o cliente autenticado do contexto
        request_user = self.context['request'].user

        # Remove itens_pedido dos dados validados para processamento posterior
        itens_pedido_data = validated_data.pop('itens_pedido', [])

        # Remove o cliente de validated_data, se existir
        validated_data.pop('cliente', None)

        # Verifica se há um pedido pendente para o cliente autenticado
        pedido_existente = Pedido.objects.filter(cliente=request_user, status='PENDENTE').first()

        if pedido_existente:
            for item_data in itens_pedido_data:
                # Valida a presença de id_produto
                id_produto = item_data.get('id_produto')
                if not id_produto:
                    raise serializers.ValidationError({'id_produto': 'Este campo é obrigatório.'})

                produto = Produto.objects.get(id=id_produto)
                tamanho_produto_nome = item_data.get('tamanho_produto')
                acrescimos_nome = item_data.get('acrescimos', [])

                tamanho_produto = TamanhoProduto.objects.filter(nome=tamanho_produto_nome).first()
                acrescimos = Acrescimos.objects.filter(nome__in=acrescimos_nome)

                # Cria o item do pedido e associa os acrescimos
                item_pedido = ItemPedido.objects.create(
                    pedido=pedido_existente,
                    produto=produto,
                    tamanho=tamanho_produto,
                )
                item_pedido.acrescimos.set(acrescimos)
            return pedido_existente

        # Caso contrário, cria um novo pedido
        pedido = Pedido.objects.create(cliente=request_user, **validated_data)

        for item_data in itens_pedido_data:
            id_produto = item_data.get('id_produto')
            if not id_produto:
                raise serializers.ValidationError({'id_produto': 'Este campo é obrigatório.'})

            produto = Produto.objects.get(id=id_produto)
            tamanho_produto_nome = item_data.get('tamanho_produto')
            acrescimos_nome = item_data.get('acrescimos', [])

            tamanho_produto = TamanhoProduto.objects.filter(nome=tamanho_produto_nome).first()
            acrescimos = Acrescimos.objects.filter(nome__in=acrescimos_nome)

            # Cria o item do pedido e associa os acrescimos
            item_pedido = ItemPedido.objects.create(
                pedido=pedido,
                produto=produto,
                tamanho=tamanho_produto,
            )
            item_pedido.acrescimos.set(acrescimos)

        return pedido
