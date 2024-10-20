from django.urls import path
from . import views

urlpatterns = [
    path('produtos/', views.listar_produtos, name='listar_produtos'),
    path('produtos/novo/', views.criar_produto, name='criar_produto'),
    path('produtos/<int:id>/editar/', views.editar_produto, name='editar_produto'),
    path('produtos/<int:id>/deletar/', views.deletar_produto, name='deletar_produto'),
    path('', views.home, name='home'),
    path('home', views.home, name='home'),
    path('cardapio', views.cardapio, name='cardapio'),
]
