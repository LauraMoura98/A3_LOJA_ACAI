# Changelog

Todas as mudanças importantes para este projeto serão documentadas neste arquivo *a partir do dia 15-11-2024
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
