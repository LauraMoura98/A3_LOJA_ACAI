from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import AllowAny, IsAuthenticated

from api_rest.models import Produto
from api_rest.serializers import ProdutoSerializer


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/produtos/{id}/',
    responses={
        200: ProdutoSerializer,
        404: "Produto não encontrado."
    }
)
@swagger_auto_schema(
    method='delete',
    operation_description='DELETE api/v1/produtos/{id}',
    responses={
        204: 'Produto deletado com sucesso.',
        404: 'Produto não encontrado.'
    }
)
@swagger_auto_schema(
    method='put',
    operation_description='PUT api/v1/produtos/{id}',
    request_body=ProdutoSerializer,
    responses={
        200: ProdutoSerializer,
        400: 'Erro de validação.',
        404: 'Produto não encontrado.'
    }
)
@api_view(['GET', 'DELETE', 'PUT'])
@permission_classes([AllowAny if "GET" else IsAuthenticated])
def produtos_por_id(request, id):
    try:
        produto = Produto.objects.get(pk=id)
    except Produto.DoesNotExist:
        return Response({
            "erro": "Produto não encontrado."
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProdutoSerializer(produto)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        produto.delete()
        return Response({
            "mensagem": "Produto deletado com sucesso."
        }, status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'PUT':
        serializer = ProdutoSerializer(produto, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=ProdutoSerializer,
    operation_description='POST api/v1/produtos/',
    responses={201: ProdutoSerializer, 400: 'Erro de Validação.'}
)
@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/produtos/',
)
@api_view(["POST", "GET"])
@permission_classes([AllowAny if "GET" else IsAuthenticated])
def produtos_geral(request):
    if request.method == "POST":
        serializer = ProdutoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "GET":
        produtos = Produto.objects.all()
        serializer = ProdutoSerializer(produtos, many=True)
        return Response(serializer.data)

    return Response(
        {"erro": "Método não permitido."},
        status=status.HTTP_405_METHOD_NOT_ALLOWED
    )
