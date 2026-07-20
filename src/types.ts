export interface Typification {
  id: string;
  origen: string;
  area: string;
  grupo: string;
  categoria: string;
  subcategoria: string;
  motivo: string;
  operacionDetalle: string;
  ejemplo: string;
}

export interface ClassificationRequest {
  query: string;
}

export interface ClassificationResponse {
  success: boolean;
  suggestedId?: string;
  confidence?: number; // 0 to 1
  explanation?: string;
  suggestedPath?: string[]; // [origen, area, grupo, categoria, subcategoria, motivo, operacionDetalle]
  error?: string;
}
