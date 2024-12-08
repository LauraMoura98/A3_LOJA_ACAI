from django.urls import path, include
from api_rest.views.categorias_views import categorias_geral, categorias_por_id
from api_rest.views.produtos_views import produtos_geral, produtos_por_id
from api_rest.views.acrescimos_views import acrescimos_geral, acrescimos_por_id
from api_rest.views.tamanho_views import tamanhos_por_id, tamanhos_geral
from api_rest.views.pedido_views import pedidos_geral, pedido_por_id
from api_rest.views.tamanho_produto_views import TamanhoProdutos_geral, TamanhoProdutos_delete
from api_rest.views.cliente_views import RegistroUsuarioViewSet, LoginUsuarioView, PedidoViewSet
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="API Açaí_Faseh",
        default_version='v1',
        description="Documentação da API da distribuidora de açaí da FASEH",
        terms_of_service="https://www.google.com/policies/terms/",
        license=openapi.License(name="Licença MIT"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Configurar router para PedidoViewSet
router = DefaultRouter()
router.register(r'pedidos/', PedidoViewSet, basename='pedido')

urlpatterns = [
    # Rotas de produtos
    path("produtos/", produtos_geral, name='Requisições gerais de Produto'),
    path("produtos/<int:id>/", produtos_por_id, name='Requisições por ID de Produto'),

    # Rotas de categorias
    path("categorias/", categorias_geral, name='Requisições gerais de Categoria'),
    path("categorias/<int:id>/", categorias_por_id, name='Requisições por ID de Categoria'),

    # Rotas de acréscimos
    path("acrescimos/", acrescimos_geral, name='Requisições Gerais de Acrescimos'),
    path("acrescimos/<int:id>/", acrescimos_por_id, name='Requisições por ID de Acrescimos'),

    # Rotas de tamanhos
    path('tamanhos/', tamanhos_geral, name='tamanhos_geral'),
    path('tamanhos/<int:id>/', tamanhos_por_id, name='tamanhos_por_id'),

    # Rotas de tamanhos-produto
    path('tamanho-produtos/', TamanhoProdutos_geral, name='tamanho_produtos_geral'),
    path('tamanho-produtos/<int:produto_id>/<str:tamanho_id>/', TamanhoProdutos_delete, name='deletar_produto_tamanho'),

    # Token de autenticação
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Rotas de autenticação e usuários
    path('usuarios/registrar/', RegistroUsuarioViewSet.as_view({'post': 'create'}), name='registrar-usuario'),
    path('usuarios/login/', LoginUsuarioView.as_view(), name='login-usuario'),

    # Swagger e Redoc
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Incluir rotas do router para PedidoViewSet
    path('', include(router.urls)),
]
