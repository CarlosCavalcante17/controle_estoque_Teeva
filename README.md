# TeeVa Estoque

Aplicacao para controle de estoque de capinhas de celular, com dashboard, cadastro de produtos, movimentacoes, estoque minimo, notificacoes, relatorios e controle de acesso.

## Como rodar

### Front-end

```bash
cd frontend/frontend
npm install
npm run dev
```



### Back-end

```bash
cd backend/backend
copy .env.example .env
npm install
npm run dev
```

A API local roda em `http://localhost:3333`.


## Funcionalidades incluidas

- Login com perfis de administrador e funcionario.
- Dashboard com total de produtos, unidades, estoque baixo, sem estoque, grafico de mais vendidos e ultimas movimentacoes.
- Cadastro, edicao e exclusao de produtos.
- Entrada, saida e ajuste manual de estoque.
- Historico completo de movimentacoes com usuario e data/hora.
- Estoque minimo com destaque visual e notificacao interna.
- Busca, filtros e paginacao.
- Exportacao CSV para Excel e PDF.
- Tema claro e escuro.
- Layout responsivo para desktop e celular.
- Backend preparado para SMTP Gmail, WhatsApp Cloud API e PostgreSQL/Prisma.
