# SaaS Gestão Confeitaria 7.0

Sistema completo de gestão para confeitarias com integração Stripe e autenticação Supabase.

## ✅ Status do Projeto

- ✅ **Frontend**: React + TypeScript + Vite + Tailwind CSS
- ✅ **Backend**: Supabase (Auth + Database + Edge Functions)
- ✅ **Pagamentos**: Stripe + Webhooks
- ✅ **Deploy**: Netlify (Frontend) + Supabase (Backend)
- ✅ **Database**: Schema completo com RLS
- ✅ **Autenticação**: Email/senha + Google OAuth
- ✅ **Proteção de Rotas**: Baseada em assinatura ativa
- ✅ **Webhooks**: Processamento automático de pagamentos
- ✅ **Testes**: Painel integrado para verificação do sistema

## 🚀 Como Funciona

### Fluxo de Autenticação
1. **Usuário se cadastra** → Cria conta no Supabase (email/senha ou Google)
2. **Usuário assina** → Paga via Stripe Checkout
3. **Webhook processa** → Atualiza status da assinatura no Supabase
4. **Acesso liberado** → Dashboard disponível para assinantes ativos

### Tecnologias
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (Auth + Database + Edge Functions)
- **Pagamentos**: Stripe + Webhooks
- **Deploy**: Netlify (Frontend) + Supabase (Backend)

## 🛠️ Configuração

### 1. Configuração Local

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://stasbepnjxxyifjhprwu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YXNiZXBuanh4eWlmamhwcnd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDgwNDAsImV4cCI6MjA3MDQyNDA0MH0.K2Sbf8kmldeUN2OtegGAhATEP7jvUJ6us-5SNemTwZY
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Rt8pCB1cuFGKX9I3b7x7HykxRsCoY42gCUxENl9EwYyTTXq2356MsHRjo8IejZXfch5q8RFzpRwzDPNvasifLOr00PJG0yQAA
VITE_STRIPE_CHECKOUT_URL=https://buy.stripe.com/test_dRmeVcfyGeKJ6np0lEefC03
```

### 2. Executar Localmente

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

### 3. Configuração do Supabase

#### 3.1 Executar Migrações
1. Acesse o [painel do Supabase](https://supabase.com/dashboard/project/stasbepnjxxyifjhprwu) > SQL Editor
2. Execute o arquivo `supabase/migrations/create_complete_schema.sql`
3. Verifique se todas as tabelas foram criadas corretamente

**Tabelas criadas:**
- `user_subscriptions` - Controle de assinaturas
- `customers` - Dados dos clientes
- `products` - Catálogo de produtos
- `orders` - Pedidos
- `order_items` - Itens dos pedidos

#### 3.2 Configurar Autenticação
1. Vá em Authentication > Settings
2. Configure os provedores desejados (Email, Google)
3. Adicione o domínio do seu site em "Site URL" e "Redirect URLs"

#### 3.3 Deploy das Edge Functions

Instale o Supabase CLI e faça deploy das funções:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Deploy das funções
supabase functions deploy stripe-webhook --project-ref stasbepnjxxyifjhprwu
supabase functions deploy check-subscription --project-ref stasbepnjxxyifjhprwu
```

#### 3.4 Configurar Variáveis das Edge Functions

No [painel do Supabase](https://supabase.com/dashboard/project/stasbepnjxxyifjhprwu) > Edge Functions > Settings, adicione:

```
STRIPE_SECRET_KEY=sk_test_51Rt8pCB1cuFGKX9I3b7x7HykxRsCoY42gCUxENl9EwYyTTXq2356MsHRjo8IejZXfch5q8RFzpRwzDPNvasifLOr00PJG0yQAA
STRIPE_WEBHOOK_SECRET=whsec_RYRCLB24COlaq7QFi4CjzldjJlU4kDwC
```

### 4. Configuração do Stripe

#### 4.1 Configurar Webhook

1. Acesse [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Clique em "Add endpoint"
3. URL: `https://stasbepnjxxyifjhprwu.supabase.co/functions/v1/stripe-webhook`
4. Eventos para escutar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copie o "Signing secret" e configure nas Edge Functions

#### 4.2 Configurar Checkout
1. Crie um produto no Stripe Dashboard
2. Configure o Checkout Session
3. Use o Price ID: `price_1RuOijB1cuFGKX9IiXufwpJU`
4. URL do Checkout já configurada: `https://buy.stripe.com/test_dRmeVcfyGeKJ6np0lEefC03`

### 5. Deploy no Netlify

#### 5.1 Variáveis de Ambiente no Netlify

Configure as seguintes variáveis no painel do Netlify:

```
VITE_SUPABASE_URL=https://stasbepnjxxyifjhprwu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YXNiZXBuanh4eWlmamhwcnd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDgwNDAsImV4cCI6MjA3MDQyNDA0MH0.K2Sbf8kmldeUN2OtegGAhATEP7jvUJ6us-5SNemTwZY
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Rt8pCB1cuFGKX9I3b7x7HykxRsCoY42gCUxENl9EwYyTTXq2356MsHRjo8IejZXfch5q8RFzpRwzDPNvasifLOr00PJG0yQAA
VITE_STRIPE_CHECKOUT_URL=https://buy.stripe.com/test_dRmeVcfyGeKJ6np0lEefC03
```

#### 5.2 Configurações de Build
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `18` (configurado via .nvmrc)

## 🧪 Testes

### Painel de Testes Integrado
1. Acesse o dashboard do sistema
2. Vá na aba "Testes"
3. Execute os testes automáticos para verificar:
   - Variáveis de ambiente
   - Conexão com Supabase
   - Função check-subscription
   - Schema do banco de dados

### Testar Fluxo de Pagamento
1. Acesse a landing page
2. Clique em "Começar Agora"
3. Complete o pagamento no Stripe (use cartão de teste: `4242 4242 4242 4242`)
4. Verifique se a assinatura foi criada no Supabase

### Testar Verificação de Assinatura
1. Acesse: `https://stasbepnjxxyifjhprwu.supabase.co/functions/v1/check-subscription?email=teste@email.com`
2. Deve retornar JSON com status da assinatura

**Exemplo de resposta:**
```json
{
  "email": "teste@email.com",
  "hasActiveSubscription": true,
  "subscription": {
    "id": "uuid",
    "subscription_status": "active",
    "current_period_end": "2025-02-15T10:30:00Z"
  }
}
```

### Testar Proteção de Rotas
1. Tente acessar `/dashboard` sem estar logado → Redireciona para login
2. Faça login sem assinatura ativa → Redireciona para página de assinatura
3. Com assinatura ativa → Acesso liberado ao dashboard

## 📋 Funcionalidades

### ✅ Sistema de Autenticação e Pagamento
- Cadastro e login com email/senha ou Google
- Integração completa com Stripe para assinaturas
- Webhook automático para processar pagamentos
- Verificação de assinatura em tempo real
- Proteção de rotas baseada em assinatura ativa

### ✅ Dashboard de Gestão
- 📦 **Pedidos**: CRUD completo com status
- 👥 **Clientes**: Gestão de dados e contatos
- 🎂 **Produtos**: Catálogo com preços e categorias
- 🔍 **Busca**: Filtros em tempo real
- 📱 **Responsivo**: Funciona em todos os dispositivos
- 📊 **Status**: Monitoramento da assinatura

### ✅ Segurança
- Row Level Security (RLS) em todas as tabelas
- Políticas baseadas no usuário autenticado
- Webhook com verificação de assinatura
- Separação de chaves públicas e secretas
- Error boundaries para tratamento de erros

## 🔄 Fluxo Completo

1. **Usuário acessa** → Landing page
2. **Cria conta** → Cadastro via email/senha ou Google
3. **Clica "Assinar"** → Stripe Checkout
4. **Paga assinatura** → Webhook processa automaticamente
5. **Status atualizado** → Assinatura ativa no Supabase
6. **Acesso liberado** → Dashboard completo disponível
7. **Gestão completa** → Pedidos, clientes e produtos

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint do código
npm run lint
```

## 📊 Monitoramento

- **Stripe Dashboard**: Acompanhe pagamentos e assinaturas
- **Supabase Dashboard**: Monitore usuários, dados e logs
- **Logs**: Edge Functions mostram processamento dos webhooks
- **Netlify Dashboard**: Status do deploy e logs de build

## 🆘 Troubleshooting

### Erro de variáveis de ambiente
- Verifique se o arquivo `.env` existe e está configurado
- Confirme se todas as variáveis `VITE_*` estão definidas
- No Netlify, verifique se as variáveis estão configuradas no painel

### Webhook não funciona
- Verifique se a URL está correta no Stripe
- Confirme se o `STRIPE_WEBHOOK_SECRET` está configurado
- Veja os logs na aba Edge Functions do Supabase
- Teste o webhook com dados de exemplo

### Problemas de autenticação
- Verifique se o usuário está cadastrado no Supabase Auth
- Confirme se a assinatura está ativa na tabela `user_subscriptions`
- Teste a função `check-subscription` diretamente

### Build falha no Netlify
- Verifique se a versão do Node.js está correta (18)
- Confirme se todas as dependências estão instaladas
- Veja os logs de build no painel do Netlify

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard/project/stasbepnjxxyifjhprwu)
- [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
- [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
- [Netlify Dashboard](https://app.netlify.com/)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Stripe](https://stripe.com/docs)

## 🔧 Comandos de Verificação

```bash
# Verificar se todas as dependências estão instaladas
npm list

# Verificar se o build funciona
npm run build

# Verificar se não há erros de lint
npm run lint

# Testar Edge Functions localmente (se Supabase CLI estiver instalado)
supabase functions serve
```

## 📋 Checklist de Deploy

### Antes do Deploy:
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Migrações executadas no Supabase
- [ ] Edge Functions deployadas no Supabase
- [ ] Webhook configurado no Stripe
- [ ] Teste de pagamento realizado

### Após o Deploy:
- [ ] Site acessível no Netlify
- [ ] Login funcionando
- [ ] Checkout redirecionando corretamente
- [ ] Webhook processando pagamentos
- [ ] Dashboard protegido por assinatura