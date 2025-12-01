import { apiFetch } from "./api";

export async function getUserApproves(userId: string) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0019/0/T/?parameters=CODUSUARIO=${encodeURIComponent(userId)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getApprovesDetail(codcoligada: number, codatendimento: number) {
  const endpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0020/0/T/?parameters=CODCOLIGADA=${encodeURIComponent(codcoligada)};CODATENDIMENTO=${encodeURIComponent(codatendimento)}`;
  return apiFetch<any>(endpoint, "GET");
}

export async function getTicketDetails(codcoligada: number, codlocal: number, codatendimento: number) {
  const endpoint = `api/construction-projects/v1/tickets/${codcoligada}|${codlocal}|${codatendimento}`;
  return apiFetch<any>(endpoint, "GET");
}

interface StepForwardPayload {
  id: string;
  companyId: number;
  locationId: number;
  ticketId: number;
  nextStepCode: number;
  flowsStepCode: number;
  comments: string;
  stepSolution: string;
}

export async function stepForwardTicket(payload: StepForwardPayload) {
  const endpoint = `api/construction-projects/v1/tickets/${payload.id}/step-forward`;
  const { id, ...bodyData } = payload;

  const bodyDataAsStrings = {
    companyId: String(bodyData.companyId),
    locationId: String(bodyData.locationId),
    ticketId: String(bodyData.ticketId),
    nextStepCode: String(bodyData.nextStepCode),
    flowsStepCode: String(bodyData.flowsStepCode),
    comments: bodyData.comments,
    stepSolution: bodyData.stepSolution
  };
  return apiFetch<any>(
    endpoint,
    "POST",
    {},
    bodyDataAsStrings
  );

}