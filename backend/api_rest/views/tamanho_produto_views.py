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
    operation_description='GET api/v1/TamanhoProduto/',
    responses={200: TamanhoProdutoSerializer(many=True)}
)
@swagger_auto_schema(
    method='post',
    request_body=TamanhoProdutoSerializer(many=True),
    operation_description='POST api/v1/TamanhoProduto/',
    responses={201: TamanhoProdutoSerializer(many=True), 400: 'Erro de Validação.'}
)
@swagger_auto_schema(
    method='delete',
    operation_description='DELETE api/v1/TamanhoProduto/{produto_id}/{tamanho_id}',
    responses={
        204: "Tamanho associado ao produto deletado com sucesso.",
        404: "Associação produto-tamanho não encontrada."
    }
)
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([AllowAny if "GET" else IsAuthenticated])
def TamanhoProdutos_geral(request, produto_id=None, tamanho_id=None):
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

    elif request.method == "POST":
        if isinstance(request.data, list):
            serializer = TamanhoProdutoSerializer(data=request.data, many=True)
        else:
            serializer = TamanhoProdutoSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE" and produto_id and tamanho_id:
        try:
            produto_tamanho = TamanhoProduto.objects.get(produto_id=produto_id, tamanho_id=tamanho_id)
        except TamanhoProduto.DoesNotExist:
            return Response(
                {"erro": "Associação produto-tamanho não encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )

        produto_tamanho.delete()
        return Response(
            {"mensagem": "Tamanho associado ao produto deletado com sucesso."},
            status=status.HTTP_204_NO_CONTENT
        )

    return Response(
        {"erro": "Operação não suportada ou parâmetros inválidos."},
        status=status.HTTP_400_BAD_REQUEST
    )
