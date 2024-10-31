from django.urls import path
from api_rest.views.categorias_views import categorias_request_all, categorias_request_by_id
from api_rest.views.produtos_views import produtos_request_all, produtos_request_by_id

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="API Açaí_Faseh",
        default_version='v1',
        description="Documentação da API da distribuidora de açaí da FASEH",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="972311036@ulife.com.br"),
        license=openapi.License(name="Licença MIT"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("produtos/", produtos_request_all, name='produtos all'),
    path("produtos/<int:id>/", produtos_request_by_id, name='produtos by id'),
    path("categorias/", categorias_request_all, name='categorias all'),
    path("categorias/<int:id>/", categorias_request_by_id, name='categorias by id'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc')
]
