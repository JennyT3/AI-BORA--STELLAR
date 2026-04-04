# AUDITORÍA AIBORA - 04 de Abril de 2026

## Resumen Ejecutivo
- Total archivos examinados: 35+ archivos en `src/pages` y `src/components`.
- Archivos problemáticos: 3 críticos (Vistos como Monster files o muy complejos).
- Código muerto detectado: Dependencias sin uso frontend, constantes hardcodeadas.
- Problemas críticos: 4 (Geração de PDFs dentro da renderização, manipulação de estado complexo massivo, Auth de localStorage mesclada nas rotas, inline styles extremos).
- Problemas menores: Typings genéricos `any`, mixagem de `theme.colors` y hardcoded colors estáticos.

## Archivos Grandes (prioridad alta)
| Archivo | Líneas | Problema | Acción recomendada |
|---------|--------|----------|-------------------|
| `Admin.tsx` | 518 | Monster file. Mas de 20 `useState`, lógica jsPDF incrustada, estilos CSS inline en todo el documento. | Extraer toda la generación de PDFs a un hook o servicio, encapsular validación de login en contexto de autenticación. |
| `Orcamento.tsx` | 627 | Altísima verbosidad con SVGs incrustados de redes, inline `jsPDF` muy denso, CSS inline complejo. | Extraer SVG a un paquete de Iconos o Componentes individuales. Exportar lógica `jsPDF` a `services/pdf.ts`. |
| `VendasDashboard.tsx` | 510 | UI abultada (Tabs de Vendedores) con variables y hooks mezclados de perfil y métricas. Estilos inline abusados. | Separar partes del perfil, faturação y tabla cliente en `/components/dashboard/vendedor`. Retirar `style={{}}` y transicionar a Tailwind. |

## Código Muerto (prioridad media)
- [ ] `express` presente en `package.json` dependencias que no se está usando en el UI final Vite.
- [ ] Constantes e identificadores estáticos (`USERS` array e imports fallback de admin en `Admin.tsx`).
- [ ] Rutas o lógica inyectada localmente en `/admin` que podría no llamarse nunca.

## Inconsistencias (prioridad media)
- [ ] Uso extensivo de estilos en línea en el código frente a la librería general de UI Tailwind/Classes que el proyecto pretendía (visto en particular en `Admin.tsx`, `Orcamento.tsx`, `VendasDashboard.tsx`).
- [ ] Colores hardcodeados abundantes (e.g. `#1A1A1A`, `#f22283`, `#3498DB`, `#ffffff`) frente a la falta de uso en partes de `theme.colors.bg.primary` en algunos components clave.
- [ ] Definiciones `any` excesivas (e.g., `(p: any)`, `setFaturaData(p)`) degradando la utilidad de TypeScript.

## Plan de Refactorización Propuesto

### Fase 1: Limpieza (sin riesgo)
1. Consolidar Tipos (Interfaces/Types en `/types`) para abandonar los tipos `any`.
2. Remover dependencias inactivas de Vercel/Vite como `express` y unificar imports.
3. Extraer constantes (ej., `SERVICOS_POR_CATEGORIA`, `REDES`) a archivos `/config/constants.ts` estáticos.

### Fase 2: División archivos grandes
1. Refactorizar lógica `jsPDF` (y subcomponetes PDF) desde `Orcamento.tsx` y `Admin.tsx` hacia una sola utilidad utilitaria en `/services/pdfBuilder.ts`.
2. Extraer Tabs y Sections dentro del Dashboard Vendas (`VendasDashboard.tsx`) y Admin para limpiar el árbol del render.

### Fase 3: Mejoras arquitectura
1. Migrar todo lo que contenga `style={{}}` a directivas CSS funcionales en TailwindCSS o sus equivalentes en `.css`.
2. Encapsular toda lógica `localStorage.getItem` en un AuthProvider global o Hook reutilizable (`useAuth`) para no colisionar rutas en `App.tsx`.
3. Mejorar robustez de seguridad pasando credenciales (`ADMIN_PASSWORD`) netamente por el Backend/Firebase o Environment seguro y no en fallbacks.

## Checklist Pre-Refactorización
- [ ] Backup creado
- [ ] Tests pasan (si existen)
- [ ] Build exitoso
