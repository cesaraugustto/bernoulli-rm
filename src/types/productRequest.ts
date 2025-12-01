export interface ProductRequestItem {
  codigoPrd: string;
  nome: string;
  idPrd: string;
  quantidade: number;
  preco: number;
  nof: string;
  expanded: boolean;
}

export interface SelectedProduct {
  codigoPrd: string;
  idPrd: string;
  nome: string;
}

export interface HeaderFilters {
  coligada: string;
  filial: string;
  checkOrcamentario: string;
  dataEmissao: string;
  centroCusto: string;
  naturezaContabil: string;
  naturezaFinanceira: string;
  classificacao: string;
  tipo: string;
  justificativa: string;
  historico: string;
}

export interface RateioItem {
  centroCusto: string;
  percentual: number;
}

export interface Coligada {
  CODCOLIGADA: string;
  NOME: string;
}

export interface Filial {
  CODFILIAL: string;
  NOME: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface RateioValidationError {
  isRateioError: boolean;
  total: number;
}