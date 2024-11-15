# Changelog

Todas as mudanças importantes para este projeto serão documentadas neste arquivo *a partir do dia 15-11-2024

## [2024-11-15]

### Adicionado
- Implementação de endpoints na API para `Acrescimos`
- Implementação dos atributo de `Acrescimo` no models de `Produtos`
- Implementação de JWT temporário para autenticação da API

## Corrigidos
- Correções nas Views de `Produtos`, especificamente nas endpoints de ID

### Alterado
- Requisições de `POST` e `PUT` do modelo `Produto` agora podem receber o atributo `name` das chaves estrangeiras relacionadas a ela (`Acrescimos` e `Produtos`)
