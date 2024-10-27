from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from api_rest.models import Categoria
from api_rest.serializers import CategoriaSerializer


@swagger_auto_schema(
    method='get',
    responses={200: CategoriaSerializer, 404: 'Categoria não encontrada'}
)
@swagger_auto_schema(
    method='delete',
    responses={204: 'Categoria deletada com sucesso', 404: 'Categoria não encontrada'}
)
@swagger_auto_schema(
    method='put',
    request_body=CategoriaSerializer,
    responses={200: CategoriaSerializer, 400: 'Erro de validação', 404: 'Categoria não encontrada'}
)
@api_view(['GET', 'DELETE', 'PUT'])
def list_delete_put_by_id(request, id):
    try:
        categoria = Categoria.objects.get(pk=id)
    except Categoria.DoesNotExist:
        return Response({"erro": "Categoria não encontrada"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CategoriaSerializer(categoria)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        try:
            categoria.delete()
            return Response({"mensagem": "Categoria deletada com sucesso"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"erro": "Erro ao tentar deletar a categoria"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'PUT':
        serializer = CategoriaSerializer(categoria, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'categoria', openapi.IN_QUERY, description="ID da categoria", type=openapi.TYPE_INTEGER
        )
    ]
)
@swagger_auto_schema(
    method='post',
    request_body=CategoriaSerializer,
    responses={201: CategoriaSerializer, 400: 'Erro de validação'}
)


@api_view(['GET', 'POST'])
def list_all_post(request):

    if request.method == 'GET':
        categorias = Categoria.objects.all()

        serializer = CategoriaSerializer(categorias, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CategoriaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(status=status.HTTP_400_BAD_REQUEST)
