from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from drf_yasg.utils import swagger_auto_schema

from api_rest.models import Categoria
from api_rest.serializers import CategoriaSerializer


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/categorias/{id}/',
    responses={
        200: CategoriaSerializer,
        404: 'Categoria não encontrada'
        }
)
@swagger_auto_schema(
    method='delete',
    operation_description='DELETE api/v1/categorias/{id}/',
    responses={
        204: 'Categoria deletada com sucesso',
        404: 'Categoria não encontrada'
        }
)
@swagger_auto_schema(
    method='put',
    operation_description='PUT api/v1/categorias/{id}/',
    request_body=CategoriaSerializer,
    responses={
        200: CategoriaSerializer,
        400: 'Erro de validação',
        404: 'Categoria não encontrada'
        }
)
@api_view(['GET', 'DELETE', 'PUT'])
def categorias_request_by_id(request, id):
    try:
        categoria = Categoria.objects.get(pk=id)
    except Categoria.DoesNotExist:
        return Response({
            "erro": "Categoria não encontrada"
            }, status=status.HTTP_404_NOT_FOUND
            )

    if request.method == 'GET':
        serializer = CategoriaSerializer(categoria)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        try:
            categoria.delete()
            return Response({
                "mensagem": "Categoria deletada com sucesso"
                }, status=status.HTTP_204_NO_CONTENT
                )
        except Exception as e:
            return Response({
                "erro": f"Erro {e} ao tentar deletar a categoria"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

    elif request.method == 'PUT':
        serializer = CategoriaSerializer(
            categoria,
            data=request.data,
            partial=True
            )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/categorias/',
)
@swagger_auto_schema(
    method='post',
    operation_description='POST api/v1/categorias/',
    request_body=CategoriaSerializer,
    responses={201: CategoriaSerializer, 400: 'Erro de validação'}
)
@api_view(['GET', 'POST'])
def categorias_request_all(request):

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
