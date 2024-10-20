from django.shortcuts import render, get_object_or_404, redirect
from .models import Produto
from .forms import ProdutoForm


# CREATE
def criar_produto(request):
    if request.method == 'POST':
        form = ProdutoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('listar_produtos')
    else:
        form = ProdutoForm()
    return render(request, 'criar_produto.html', {'form': form})


# READ (Listar Produtos)
def listar_produtos(request):
    produtos = Produto.objects.all()
    return render(request, 'listar_produto.html', {'produtos': produtos})


# UPDATE
def editar_produto(request, id):
    produto = get_object_or_404(Produto, id=id)
    if request.method == 'POST':
        form = ProdutoForm(request.POST, instance=produto)
        if form.is_valid():
            form.save()
            return redirect('listar_produtos')
    else:
        form = ProdutoForm(instance=produto)
    return render(request, 'editar_produto.html', {
                'form': form, 'produto': produto
            }
        )


# DELETE
def deletar_produto(request, id):
    produto = get_object_or_404(Produto, id=id)
    if request.method == 'POST':
        produto.delete()
        return redirect('listar_produtos')
    return render(request, 'deletar_produto.html', {'produto': produto})
 
    
# HOME
def home(request):
    return render(request, 'home.html')

 
# CARDAPIO 
def cardapio(request):
    produtos = Produto.objects.all()  # Busca todos os produtos
    return render(request, 'cardapio.html', {'produtos': produtos})  # Passa os produtos para o template
