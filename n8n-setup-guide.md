# AIBORA - Configuración n8n para Sincronizar Clientes

## 1. Credentials en n8n

### Firebase API
- Ve a **Credentials** → New → Firebase
- Project ID: (busca en .env.local → VITE_FIREBASE_PROJECT_ID)
- Credentials JSON: necesitas el service account de Firebase

### Google Sheets OAuth2
- Ve a **Credentials** → New → Google Sheets OAuth2
- Conecta tu cuenta de Google

## 2. Workflow - Pasos en n8n

### Trigger (cada 15 min o manual)
```
Nodes → Schedule Trigger → Every 15 minutes
```

### Firebase - Get Clientes
```
Firebase → Get All Documents
Collection: clientes
```

### Google Sheets - Append Row
```
Google Sheets → Append Row
Spreadsheet: (tu Excel de Drive)
Sheet: Sheet1
Columns (A-K):
  A: nome
  B: email
  C: telemovel
  D: nif
  E: morada
  F: categoria
  G: dataEntrada
  H: totalFacturado
  I: numeroOrcamentos
  J: estado
  K: observacoes
```

## 3. Mapping de datos

En el nodo de Google Sheets, usa esta expresión para cada celda:

| Celda | Expresión |
|-------|-----------|
| A (nome) | `{{ $json.nome }}` |
| B (email) | `{{ $json.email }}` |
| C (telemovel) | `{{ $json.telemovel }}` |
| D (nif) | `{{ $json.nif }}` |
| E (morada) | `{{ $json.morada }}` |
| F (categoria) | `{{ $json.categoria }}` |
| G (dataEntrada) | `{{ new Date($json.createdAt).toLocaleDateString('pt-PT') }}` |
| H (totalFacturado) | `{{ $json.totalFacturado }}` |
| I (numeroOrcamentos) | `{{ $json.numeroOrcamentos }}` |
| J (estado) | `{{ $json.estado }}` |
| K (observacoes) | `{{ $json.observacoes }}` |

## 4. Notas

- Este workflow añade nuevas filas (no actualiza)
- Para actualizar existentes, necesitas logic de "Buscar y actualizar"
- El trigger puede ser: manual, cada 15min, o cuando haya cambio en Firebase (usando Webhooks)

## 5. Probar

1. Crea un cliente en Admin → Clientes
2. Ejecuta el workflow manualmente en n8n
3. Verifica que aparece en tu Google Sheet