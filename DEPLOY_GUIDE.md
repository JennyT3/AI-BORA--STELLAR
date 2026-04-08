# ============================================
# GUIA DE DEPLOY - CLOUD FUNCTIONS (RESEND)
# ============================================

## 🚀 PASSO A PASSO

### 1. Preparar Functions
```bash
cd functions
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar API Key do Resend

**Opção A - Variável de ambiente:**
```bash
export RESEND_API_KEY=re_TU_API_KEY_AQUI
```
(Obtenha a API key em: https://resend.com/settings/api-keys)

**Opção B - Firebase Secrets (Recomendado):**
```bash
firebase functions:secrets:set RESEND_API_KEY
```
(Quando solicitado, cole a sua API key do Resend)

### 4. Deploy das Cloud Functions
```bash
firebase deploy --only functions
```

### 5. Copiar URL da Cloud Function

O deploy retornará uma URL como:
```
https://us-central1-aibora-propostas.cloudfunctions.net/sendEmail
```

**Copie esta URL!**

### 6. Atualizar .env.local

Abra `.env.local` e atualize:
```bash
VITE_CLOUD_FUNCTION_URL=https://us-central1-aibora-propostas.cloudfunctions.net/sendEmail
```

### 7. Testar o sistema

Após o deploy, teste:

1. **Criar novo vendedor no admin:**
   - vá para `/admin` → Vendedores → Novo Vendedor
   - Preencha nome e email
   - Clique "Guardar Vendedor"
   
2. **Verificar emails:**
   - ✅ Email para admin (geral@aibora.pt): "Novo colaborador registrado"
   - ⚠️ Em produção, o vendedor também receberá email de acesso

3. **Testar aprovação:**
   - Edite o vendedor, desmarque "Ativo" e salve
   - Marque "Ativo" novamente e salve
   - O vendedor deve receber email de acesso

---

## 📋 CHECKLIST DE DEPLOY

```bash
# 1. Navegar para functions
cd functions

# 2. Instalar
npm install

# 3. Configurar API Key (escolha uma opção)
# Opção A:
export RESEND_API_KEY=re_xxxxxxx
# Opção B:
firebase functions:secrets:set RESEND_API_KEY

# 4. Deploy
firebase deploy --only functions

# 5. Copiar URL retornada

# 6. Atualizar .env.local com a URL
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Desenvolvimento local:** Use emuladores:
   ```bash
   firebase emulators:start --only functions
   ```
   Emails serão simulados no console.

2. **Produção:** Deploy das functions é necessário para emails reais.

3. **URL diferente:** A URL varia por projeto. Sempre copie do output do deploy.

4. **Resend domain:** Seu domínio `aibora.pt` deve estar verificado no Resend para enviar emails do endereço `geral@aibora.pt`.

---

## 🔧 TROUBLESHOOTING

**Erro: "RESEND_API_KEY is not set"**
- Execute: `firebase functions:secrets:set RESEND_API_KEY`

**Erro: "Function URL not found"**
- Verifique se a URL no .env.local corresponde à URL do deploy

**Emails não chegam:**
- Verifique spam em ProtonMail
- Verifique se o domínio está verificado no Resend

---

## 📞 SUPORTE

Após o deploy, verifique:
1. Cloud Functions no Firebase Console
2. Logs em "Logging" → "Cloud Functions"
3. Resend Dashboard → Sent emails