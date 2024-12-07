from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import AllowAny, IsAuthenticated

from api_rest.models import TamanhoProduto
from api_rest.serializers import TamanhoProdutoSerializer


from collections import defaultdict


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/tamanho-produtos/',
    responses={200: TamanhoProdutoSerializer(many=True)}
)
@swagger_auto_schema(
    method='post',
    request_body=TamanhoProdutoSerializer,
    operation_description='POST api/v1/tamanho-produtos/',
    responses={201: TamanhoProdutoSerializer, 400: 'Erro de validação.'}
)
@swagger_auto_schema(
    method='put',
    request_body=TamanhoProdutoSerializer,
    operation_description='PUT api/v1/tamanho-produtos/',
    responses={200: TamanhoProdutoSerializer, 400: 'Erro de validação.', 404: 'Associação produto-tamanho não encontrada.'}
)
@api_view(['GET', 'POST', 'PUT'])
@permission_classes([AllowAny if "GET" else IsAuthenticated])
def TamanhoProdutos_geral(request, produto_id=None, tamanho_id=None):
    # GET: Agrupar tamanhos e preços no formato desejado
    if request.method == "GET":
        produtos = TamanhoProduto.objects.values("produto_id", "tamanho__nome", "preco").all()

        dados_produtos = defaultdict(dict)
        for item in produtos:
            produto_id = item["produto_id"]
            tamanho_nome = item["tamanho__nome"]
            preco = item["preco"]
            dados_produtos[produto_id][tamanho_nome] = preco

        resposta = []
        for produto, tamanhos in dados_produtos.items():
            resposta.append({
                "Produto": produto,
                "Tamanhos": tamanhos
            })

        return Response(resposta)

    # POST: Criar uma nova associação entre produto e tamanho
    elif request.method == "POST":
        serializer = TamanhoProdutoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PUT: Atualizar dados de preço no banco
    elif request.method == "PUT":
        try:
            # Busca a associação para atualizar
            produto_tamanho = TamanhoProduto.objects.get(
                produto_id=request.data.get("produto_id"),
                tamanho_id=request.data.get("tamanho_id")
            )
            # Atualiza o preço
            produto_tamanho.preco = request.data.get("preco")
            produto_tamanho.save()

            serializer = TamanhoProdutoSerializer(produto_tamanho)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except TamanhoProduto.DoesNotExist:
            return Response(
                {"erro": "Associação produto-tamanho não encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )


@swagger_auto_schema(
    method='delete',
    operation_description='DELETE api/v1/tamanho-produtos/{produto_id}/{tamanho_id}',
    responses={
        204: "Associação produto-tamanho deletada com sucesso.",
        404: "Associação produto-tamanho não encontrada."
    }
)
@api_view(['DELETE'])
def TamanhoProdutos_delete(request, produto_id=None, tamanho_id=None):

    if request.method == "DELETE" and produto_id and tamanho_id:
        try:
            produto_tamanho = TamanhoProduto.objects.get(produto_id=produto_id, tamanho_id=tamanho_id)
            produto_tamanho.delete()
            return Response(
                {"mensagem": "Associação produto-tamanho deletada com sucesso."},
                status=status.HTTP_204_NO_CONTENT
            )
        except TamanhoProduto.DoesNotExist:
            return Response(
                {"erro": "Associação produto-tamanho não encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )

    return Response(
        {"erro": "Operação não suportada ou parâmetros inválidos."},
        status=status.HTTP_400_BAD_REQUEST
    )
