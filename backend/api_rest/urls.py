from django.urls import path
from api_rest.views.categorias_views import categorias_geral, categorias_por_id
from api_rest.views.produtos_views import produtos_geral, produtos_por_id
from api_rest.views.acrescimos_views import acrescimos_geral, acrescimos_por_id
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

urlpatterns = [
    path("produtos/", produtos_geral, name='Requisições gerais de Produto'),
    path("produtos/<int:id>/", produtos_por_id, name='Requisições por ID de Produto'),
    path("categorias/", categorias_geral, name='Requisições gerais de Categoria'),
    path("categorias/<int:id>/", categorias_por_id, name='Requisições por ID de Categoria'),
    path("acrescimos/", acrescimos_geral, name='Requisições Gerais de Acrescimos'),
    path("acrescimos/<int:id>", acrescimos_por_id, name='Requisições por ID de Acrescimos'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
