# Changelog

Todas as mudanças importantes para este projeto serão documentadas neste arquivo *a partir do dia 15-11-2024
## [2024-12-07]

### Adicionado
- Páginas de administração

### Corrigido
- Carregamento dos atributos dos produtos

### Alterado
- Salvamento do banco de dados
- Backend
- API de tamanhos

### TODO
- Pedidos e carrinho de pedidos
- Forma de apagar pedidos
- Corrigir erro ao adicionar acréscimo

## [2024-12-06]

### Adicionado
- Form de login, para obter token
- Form de criação de produtos e categorias

### Corrigido
- Barra de navegação das categorias

### Alterado
- Caminhos da api
- Foto Poyatos
- Títulos na página sobre

## [2024-12-05]

### Corrigido
- Caminhos dos statics do django e do swagger foram corrigidos no nginx.conf
- CSS dos produtos

### Alterado
- Endpoints de `GET`foram configuradas para serem públicas

### Adicionado
- Fotos restantes na galeria

## [2024-12-04]

### Adicionado
- Galeria dos membros na página sobre

### TODO
- Adicionar fotos restantes
- Corrigir statics
- Fazer páginas de administração
- Terminar de adicionar GET públicos
- Verificar banco de dados
- Criar método de atutenticar usuário
- Parte de pedidos vinculados à usuário
- Css dinâmico

## [2024-12-03]

### Alterado
- Nomes, apenas nome e sobrenome no site
- Criado começo da integração da parte de administração

## [2024-12-02]

### Adicionado
- Widget de acessibilidade

### Alterado
- Favicon via static
- Texto na página inicial no lugar do lorem ipsilum
- História e missão da empresa no sobre
- Link no botão na home que redireciona para produtos
- Nomes dos membros do grupo

### TODO
-  Galeria com os membros do grupo e professores no sobre
-  Página funcional de administração do catálogo

## [2024-11-25]

### Adicionado
- Implementação de endpoints na API para `Tamanho_produtos`
- shell script para inicio automático de containers na instancia ao reiniciar a máquina

## [2024-11-21]

### Adicionado
- Implementação de endpoints na API para `Pedidos`

## [2024-11-17]

### Adicionado
- Implementação de endpoints na API para `Tamanhos`

### TODO
- Implementar Banco de Dados Relacional (não integrado com Django) para melhor tráfego de dados.
- Implementar endpoints de `TamanhoProduto`

## [2024-11-16]

### Adicionado
- Implementação de um volume do banco de dados sqlite para que os dados persistam em cada deploy
- Implementação de deploy do Front-End com Vercel

### Corrigido
- Correções nas chamadas de chaves estrangeiras no model de `Produtos`

### Alterado
- Refatoração de workflow do Github Actions em mais steps para melhor legibilidade

## [2024-11-15]

### Adicionado
- Implementação de endpoints na API para `Acrescimos`
- Implementação dos atributo de `Acrescimos` no models de `Produtos`
- Implementação de JWT temporário para autenticação da API

### Corrigido
- Correções nas Views de `Produtos`, especificamente nas endpoints de ID

### Alterado
- Requisições de `POST` e `PUT` do modelo `Produto` agora podem receber o atributo `name` das chaves estrangeiras relacionadas a ela (`Acrescimos` e `Produtos`)
