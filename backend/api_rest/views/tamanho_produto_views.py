from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import AllowAny, IsAuthenticated

from api_rest.models import ProdutoTamanho, Produto, Tamanho
from api_rest.serializers import ProdutoTamanhoSerializer

@swagger_auto_schema(
    method='post',
    request_body={
        'produto_id': 'int',
        'tamanhos': [
            {'tamanho_id': 'int', 'preco': 'decimal'}
        ]
    },
    operation_description='POST api/v1/ProdutoTamanho/',
    responses={
        201: "Tamanhos adicionados com sucesso.",
        400: "Erro de validação.",
        404: "Produto ou tamanho não encontrado."
    }
)
@swagger_auto_schema(
    method='get',
    operation_description='GET api/v1/ProdutoTamanho/',
    responses={200: ProdutoTamanhoSerializer(many=True)}
)
@api_view(["POST", "GET"])
@permission_classes([AllowAny if "GET" else IsAuthenticated])
def ProdutoTamanho_geral(request):
    if request.method == "GET":
        produto_tamanhos = ProdutoTamanho.objects.all()
        serializer = ProdutoTamanhoSerializer(produto_tamanhos, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        produto_id = request.data.get("produto_id")
        tamanhos = request.data.get("tamanhos")

        if not produto_id or not tamanhos:
            return Response(
                {"error": "Produto e tamanhos são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            produto = Produto.objects.get(pk=produto_id)
        except Produto.DoesNotExist:
            return Response(
                {"error": "Produto não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        errors = []
        created = []

        for tamanho_data in tamanhos:
            tamanho_id = tamanho_data.get("tamanho_id")
            preco = tamanho_data.get("preco")

            try:
                tamanho = Tamanho.objects.get(pk=tamanho_id)
            except Tamanho.DoesNotExist:
                errors.append({"tamanho_id": tamanho_id, "error": "Tamanho não encontrado."})
                continue

            if ProdutoTamanho.objects.filter(produto=produto, tamanho=tamanho).exists():
                errors.append({"tamanho_id": tamanho_id, "error": "Tamanho já associado ao produto."})
                continue

            produto_tamanho = ProdutoTamanho(produto=produto, tamanho=tamanho, preco=preco)
            produto_tamanho.save()
            created.append({"tamanho_id": tamanho_id, "preco": preco})

        response = {
            "created": created,
            "errors": errors
        }

        status_code = status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST
        return Response(response, status=status_code)
