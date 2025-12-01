import { apiFetch } from "./api";

export interface LoginResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  if (!username || !password) {
    return { success: false, message: "Preencha usuário e senha" };
  }

  const authEndpoint = "https://tbc-hml.bernoulli.com.br:8077/api/connect/token";

  try {
    const authResponse = await fetch(authEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (!authResponse.ok) {
      return { success: false, message: "Usuário ou senha incorretos" };
    }

    const authData = await authResponse.json();

    if (authData.token || authData.access_token) {
      sessionStorage.setItem("authToken", authData.token || authData.access_token);
    }

    const credentials = btoa(`${username}:${password}`);
    const userDataEndpoint = `api/framework/v1/consultaSQLServer/RealizaConsulta/API.ERP.0001/0/T/?parameters=CODUSUARIO=${encodeURIComponent(username)}`;

    const userData = await apiFetch<any>(userDataEndpoint, "GET", {
      Authorization: `Basic ${credentials}`
    });

    if (!userData || (Array.isArray(userData) && userData.length === 0)) {
      return { success: false, message: "Usuário autenticado, mas sem dados cadastrados" };
    }

    sessionStorage.setItem("savedUser", username);
    sessionStorage.setItem("savedPass", password);

    return { success: true, data: userData };
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}

export function logout() {
  sessionStorage.removeItem("savedUser");
  sessionStorage.removeItem("savedPass");
  sessionStorage.removeItem("authToken");
}