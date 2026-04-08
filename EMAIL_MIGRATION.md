# ============================================
# MIGRACIÓN EMAILJS → RESEND
# ============================================
# Proyecto: AIBORA
# Fecha: Abril 2026

## 📋 RESUMEN DE CAMBIOS

### Archivos Creados:
- `functions/src/index.ts` - Firebase Cloud Function con Resend
- `functions/package.json` - Dependencias para Functions
- `src/services/emailService.ts` - Refactorizado para usar Cloud Function

### Archivos Modificados:
- `.env.local` - Añadido VITE_CLOUD_FUNCTION_URL
- `.env.example` - Actualizado
- `package.json` - Eliminado @emailjs/browser

### Archivos Eliminados:
- `@emailjs/browser` dependencia

---

## 🚀 INSTRUCCIONES DE INSTALACIÓN

### Paso 1: Configurar Firebase Cloud Functions

```bash
# 1. Navegar a la carpeta functions
cd functions

# 2. Instalar dependencias
npm install

# 3. Configurar API Key de Resend como variable de entorno
# Opción A: Variable de entorno directamente
export RESEND_API_KEY=re_tu_api_key_aqui

# Opción B: Usar Firebase Secrets (recomendado)
firebase functions:secrets:set RESEND_API_KEY
# (ingresa tu API key cuando se solicite)

# 4. Deploy de las Cloud Functions
firebase deploy --only functions

# 5. Obtener la URL de la función
# La URL será algo como:
# https://us-central1-aibora-propostas.cloudfunctions.net/sendEmail
```

### Paso 2: Actualizar .env.local

```bash
# Añadir la URL de la Cloud Function
VITE_CLOUD_FUNCTION_URL=https://us-central1-tu-proyecto.cloudfunctions.net/sendEmail
```

### Paso 3: Probar el sistema

```bash
# Iniciar emuladores (para desarrollo)
firebase emulators:start --only functions

# Probar endpoint
curl -X POST http://localhost:5001/aibora-propostas/us-central1/sendEmail \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","templateId":"confirmacao-orcamento","templateData":{"clienteNome":"Test"}}'
```

---

## 📧 TEMPLATES CONFIGURADOS (Resend)

Los siguientes templates están incluidos en `functions/src/index.ts`:

| Template ID | Asunto | Uso |
|-------------|--------|-----|
| `confirmacao-orcamento` | Recebemos seu orçamento | Confirmar orçamento recebido |
| `link-proposta` | Sua proposta exclusiva | Enviar link de proposta |
| `resposta-proposta` | Resposta recebida | Notificar resposta (aceite/rechazo) |
| `entrega-aprovada` | Entrega confirmada | Confirmar aprovação de entrega |
| `fatura` | Fatura disponível | Enviar fatura al cliente |
| `novo-colaborador-admin` | Novo colaborador registrado | Notificar admin (novo vendedor) |
| `acesso-colaborador` | Acesso à plataforma Aibora | Acceso colaborador (SIN password) |

---

## 🔄 FUNCIONES DEL EMAIL SERVICE

### Funciones existentes (actualizadas):
```typescript
sendConfirmationEmail(data)     // ✅ Conectado en OrcamentoModal, CTAFooterSection
sendPropostaLinkEmail(data)     // ✅ Conectado en Orcamento.tsx
sendPropostaRespostaEmail(data) // ✅ Conectado en useAdminData, Proposta.tsx
sendDeliveryApprovalEmail(data) // ✅ Conectado en tareas.ts
sendFaturaEmail(data)           // ✅ Conectado en tareas.ts
```

### Nuevas funciones creadas:
```typescript
notificarNovoColaboradorAdmin(data) // Para notificar al admin
enviarAcessoColaborador(data)       // Enviar acceso al vendedor (SIN password)
```

### Función eliminada:
```typescript
// ❌ ELIMINADA: sendVendedorAccessEmail
// Motivo: No debe enviar passwords por email
// Solución: El vendedor usa "Esqueci a password" en /vendas
```

---

## 🔗 DÓNDE SE LLAMA CADA EMAIL

| Email | Componente | Estado |
|-------|------------|--------|
| Confirmación orçamento | OrcamentoModal.tsx | ✅ Ya conectado |
| Confirmación orçamento | CTAFooterSection.tsx | ✅ Ya conectado |
| Link proposta | Orcamento.tsx | ✅ Ya conectado |
| Respuesta proposta | useAdminData.ts | ✅ Ya conectado |
| Respuesta proposta | Proposta.tsx | ✅ Ya conectado |
| Entrega aprobada | tareas.ts | ✅ Ya conectado |
| Fatura | tareas.ts | ✅ Ya conectado |
| Nuevo colaborador (admin) | Vendores.tsx | ❌ Pendiente |
| Acceso colaborador | Vendores.tsx | ❌ Pendiente |

---

## ⚠️ PENDIENTE: Conectar Emails de Colaboradores

En `src/pages/admin/Vendores.tsx`, añadir:

```typescript
import { notificarNovoColaboradorAdmin, enviarAcessoColaborador } from '../../services/emailService';

// Después de crear un nuevo vendedor:
// notificarNovoColaboradorAdmin({ vendedorNome, vendedorEmail, dataRegistro })

// Después de aprobar un vendedor:
// enviarAcessoColaborador({ vendedorNome, email, linkLogin })
```

---

## 🧪 CHECKLIST DE TESTING

- [ ] Cloud Function desplegada correctamente
- [ ] Emails llegan a geral@aibora.pt (ProtonMail)
- [ ] sendConfirmationEmail funciona desde formulario
- [ ] sendPropostaLinkEmail funciona
- [ ] sendPropostaRespostaEmail funciona
- [ ] sendFaturaEmail funciona
- [ ] NO queda código de EmailJS en el proyecto
- [ ] NO existe sendVendedorAccessEmail

---

## 📝 NOTAS IMPORTANTES

1. **Seguridad**: La API key de Resend está solo en las Cloud Functions, nunca en el frontend
2. **Contraseñas**: Los colaboradores reciben email de acceso SIN password - deben usar "Esqueci a password"
3. **Desarrollo**: En localhost, los emails se simulan (no se envían realmente)
4. **Producción**: Desplegar Cloud Functions para enviar emails reales