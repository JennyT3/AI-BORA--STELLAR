// ============================================
// VALIDAÇÕES E SANITIZAÇÃO
// ============================================

// ============================================
// VALIDAÇÕES DE EMAIL
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ============================================
// VALIDAÇÕES DE TELEFONE (Portugal)
// ============================================

export function isValidPhone(pt: string): boolean {
  const cleaned = pt.replace(/\D/g, '');
  // Portugal: 9 dígitos começando com 9 outelefones starts com 2
  return cleaned.length >= 9 && cleaned.length <= 11;
}

export function sanitizePhone(pt: string): string {
  return pt.replace(/\D/g, '');
}

export function formatPhone(pt: string): string {
  const cleaned = pt.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  return pt;
}

// ============================================
// VALIDAÇÃO DE NIF PORTUGUÊS
// ============================================

export function isValidNIF(nif: string): boolean {
  if (!nif || nif.length !== 9) return false;
  
  const num = nif.replace(/\D/g, '');
  if (num.length !== 9) return false;
  
  // NIF deve começar por 1, 2, 3, 4, 5, 6, 7, 8 ou 9
  const firstDigit = parseInt(num[0]);
  if (firstDigit < 1 || firstDigit > 9) return false;
  
  // Algoritmo de validação de NIF
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(num[i]) * (9 - i);
  }
  
  const checkDigit = 11 - (sum % 11);
  const calculatedCheck = checkDigit >= 10 ? 0 : checkDigit;
  
  return calculatedCheck === parseInt(num[8]);
}

export function sanitizeNIF(nif: string): string {
  return nif.replace(/\D/g, '');
}

// ============================================
// SANITIZAÇÃO DE STRINGS (PREVENÇÃO XSS)
// ============================================

export function sanitizeString(str: string): string {
  if (!str) return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function sanitizeHtml(allowedTags: string[] = ['b', 'i', 'u', 'em', 'strong']): (html: string) => string {
  return (html: string) => {
    if (!html) return '';
    
    // Simple HTML sanitization - strip dangerous tags
    let sanitized = html;
    
    // Remove script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove on* event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    return sanitized;
  };
}

// ============================================
// VALIDAÇÃO DE INPUTS NUMÉRICOS
// ============================================

export function isValidNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

export function sanitizeNumber(value: any): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// ============================================
// VALIDAÇÃO DE URL
// ============================================

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

// ============================================
// VALIDAÇÃO DE DATA
// ============================================

export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export function sanitizeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString();
}

// ============================================
// VALIDAÇÃO COMPLETA DE FORMULÁRIO
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateCliente(data: {
  nome?: string;
  email?: string;
  telemovel?: string;
  nif?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.nome?.trim()) {
    errors.nome = 'Nome é obrigatório';
  } else if (data.nome.length > 200) {
    errors.nome = 'Nome muito longo (máx 200 caracteres)';
  }
  
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }
  
  if (data.telemovel && !isValidPhone(data.telemovel)) {
    errors.telemovel = 'Telemóvel inválido';
  }
  
  if (data.nif && !isValidNIF(data.nif)) {
    errors.nif = 'NIF inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateProposta(data: {
  cliente?: string;
  email?: string;
  valor?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.cliente?.trim()) {
    errors.cliente = 'Nome do cliente é obrigatório';
  }
  
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }
  
  if (data.valor !== undefined && data.valor < 0) {
    errors.valor = 'Valor não pode ser negativo';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ============================================
// SANITIZAÇÃO DE DADOS ANTES DE GUARDAR
// ============================================

export function sanitizeClienteData(data: any): any {
  return {
    ...data,
    nome: data.nome ? sanitizeString(data.nome) : undefined,
    email: data.email ? sanitizeEmail(data.email) : undefined,
    telemovel: data.telemovel ? sanitizePhone(data.telemovel) : undefined,
    nif: data.nif ? sanitizeNIF(data.nif) : undefined,
    empresa: data.empresa ? sanitizeString(data.empresa) : undefined,
    morada: data.morada ? sanitizeString(data.morada) : undefined,
    observacoes: data.observacoes ? sanitizeString(data.observacoes) : undefined,
  };
}

export function sanitizePropostaData(data: any): any {
  return {
    ...data,
    cliente: data.cliente ? sanitizeString(data.cliente) : undefined,
    email: data.email ? sanitizeEmail(data.email) : undefined,
    telefone: data.telefone ? sanitizePhone(data.telefone) : undefined,
    empresa: data.empresa ? sanitizeString(data.empresa) : undefined,
    website: data.website ? sanitizeUrl(data.website) : undefined,
    nif: data.nif ? sanitizeNIF(data.nif) : undefined,
    morada: data.morada ? sanitizeString(data.morada) : undefined,
  };
}