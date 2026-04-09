// ============================================
// VALIDATION AND SANITIZATION
// ============================================

// ============================================
// EMAIL VALIDATION
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ============================================
// PHONE VALIDATION (Portugal)
// ============================================

export function isValidPhone(pt: string): boolean {
  const cleaned = pt.replace(/\D/g, '');
  // Portugal: typically 9 digits starting with 9, or landlines starting with 2
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
// PORTUGUESE TAX ID (NIF) VALIDATION
// ============================================

export function isValidNIF(nif: string): boolean {
  if (!nif || nif.length !== 9) return false;
  
  const num = nif.replace(/\D/g, '');
  if (num.length !== 9) return false;
  
  // NIF must start with 1–9
  const firstDigit = parseInt(num[0]);
  if (firstDigit < 1 || firstDigit > 9) return false;
  
  // NIF check digit algorithm
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
// STRING SANITIZATION (XSS PREVENTION)
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
// NUMERIC INPUT VALIDATION
// ============================================

export function isValidNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

export function sanitizeNumber(value: any): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// ============================================
// URL VALIDATION
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
// DATE VALIDATION
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
// FULL FORM VALIDATION
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
    errors.nome = 'Name is required';
  } else if (data.nome.length > 200) {
    errors.nome = 'Name is too long (max 200 characters)';
  }
  
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email';
  }
  
  if (data.telemovel && !isValidPhone(data.telemovel)) {
    errors.telemovel = 'Invalid mobile number';
  }
  
  if (data.nif && !isValidNIF(data.nif)) {
    errors.nif = 'Invalid tax ID (NIF)';
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
    errors.cliente = 'Client name is required';
  }
  
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email';
  }
  
  if (data.valor !== undefined && data.valor < 0) {
    errors.valor = 'Amount cannot be negative';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ============================================
// SANITIZE DATA BEFORE SAVE
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