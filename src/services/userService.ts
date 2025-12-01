import { apiFetch } from "./api";

export async function getUserDetails(userId: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.USER.0002/0/T/?parameters=ID=${encodeURIComponent(userId)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getUserScByGroup(userId: string, ano: number) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0006/0/T/?parameters=usuarioLogado=${encodeURIComponent(userId)};ano=${ano}`;
  return apiFetch<any>(endpoint, "GET");
}


export async function getUserScByMonth(userId: string, ano: string, mes: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0017/0/T/?parameters=usuarioLogado=${encodeURIComponent(userId)};ANO=${encodeURIComponent(ano)};MES=${encodeURIComponent(mes)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getUserRequest(idMov: string, codColigada: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0018/0/T/?parameters=IDMOV=${encodeURIComponent(idMov)};CODCOLIGADA=${encodeURIComponent(codColigada)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getUserPermission(codusuario: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0016/0/T/?parameters=CODUSUARIO=${encodeURIComponent(codusuario)}`;
  return apiFetch<any>(endpoint, "GET");
}
