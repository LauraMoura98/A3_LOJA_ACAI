from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import AllowAny, IsAuthenticated

from api_rest.models import TamanhoProduto
from api_rest.serializers import TamanhoProdutoSerializer


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/TamanhoProduto/{id}',
    responses={200: TamanhoProdutoSerializer, 404: "Tamanho_Produto não encontrado."}
)
@swagger_auto_schema(
    method='delete',
    operation_description='DELETE api/v1/TamanhoProduto/{id}',
    responses={204: 'TamanhoProduto deletado com sucesso.', 404: 'Tamanho_Produto não encontrado.'}
)
@swagger_auto_schema(
    method='put',
    operation_description='PUT api/v1/TamanhoProduto/{id}',
    request_body=TamanhoProdutoSerializer,
    responses={200: TamanhoProdutoSerializer, 400: 'Erro de validação.', 404: 'Tamanho_Produto não encontrado.'}
)
@api_view(['GET', 'DELETE', 'PUT'])
@permission_classes([AllowAny if "GET" else IsAuthenticated])
def TamanhoProdutos_por_id(request, id):
    try:
        tamanho_produto = TamanhoProduto.objects.get(pk=id)
    except tamanho_produto.DoesNotExist:
        return Response({"erro": "TamanhoProduto não encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TamanhoProdutoSerializer(tamanho_produto)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        tamanho_produto.delete()
        return Response({"mensagem": "Tamanho_Produto deletado com sucesso."}, status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'PUT':
        serializer = TamanhoProdutoSerializer(tamanho_produto, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()


@swagger_auto_schema(
    method='post',
    request_body=TamanhoProdutoSerializer,
    operation_description='POST api/v1/TamanhoProdutos/',
    responses={201: TamanhoProdutoSerializer, 400: 'Erro de Validação.'}
)
@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/TamanhoProdutos/',
)
@api_view(["POST", "GET"])
@permission_classes([AllowAny if "GET" else IsAuthenticated])
def TamanhoProdutos_geral(request):
    if request.method == "GET":
        tamanho_produto = TamanhoProduto.objects.all()
        serializer = TamanhoProdutoSerializer(tamanho_produto, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = TamanhoProdutoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
