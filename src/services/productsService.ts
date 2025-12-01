import { apiFetch } from "./api";

export async function getAllProducts() {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0002/0/T/`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsDetails(codigoprd: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0003/0/T/?parameters=CODIGOPRD=${encodeURIComponent(codigoprd)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsColigada(codusuario: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0007/0/T/?parameters=CODUSUARIO=${encodeURIComponent(codusuario)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsFilial(codcoligada: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0008/0/T/?parameters=CODCOLIGADA=${encodeURIComponent(codcoligada)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsCC(codcoligada: string, codusuario: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0009/0/T/?parameters=CODCOLIGADA=${encodeURIComponent(codcoligada)};CODUSUARIO=${encodeURIComponent(codusuario)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsNC(codcoligada: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0010/0/T/?parameters=CODCOLIGADA=${encodeURIComponent(codcoligada)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsNF(codcoligada: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0011/0/T/?parameters=CODCOLIGADA=${encodeURIComponent(codcoligada)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsClassificacao(codcoligada: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0012/0/T/?parameters=CODCOLIGADA=${encodeURIComponent(codcoligada)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsTipo(codcoligada: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0013/0/T/?parameters=CODCOLIGADA=${encodeURIComponent(codcoligada)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsJustificativa(codcoligada: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0014/0/T/?parameters=CODCOLIGADA=${encodeURIComponent(codcoligada)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getProductsNOF(codcoligada: string, codigoprd: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0015/0/T/?parameters=CODCOLIGADA=${encodeURIComponent(codcoligada)};CODIGOPRD=${encodeURIComponent(codigoprd)}`;
  return apiFetch<any>(endpoint, "GET");
}

interface MovementItem {
  sequentialId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  budgetGroupCode: string;
}

interface CreateMovementPayload {
  companyId: number;
  movementId: number;
  branchId: number;
  warehouseCode: string;
  movementTypeCode: string;
  registerDate: string;
  extraDate1: string;
  longHistory: string;
  financialOptionalTable1Code: string;
  financialOptionalTable4Code: string;
  costCenterCode: string;
  movementItems: MovementItem[];
}

export async function createProductMovement(payload: CreateMovementPayload) {
  const endpoint = 'api/mov/v1/movements';
  return apiFetch<any>(endpoint, "POST", {}, payload);
}