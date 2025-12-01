const API_BASE_URL = "https://tbc-hml.bernoulli.com.br:8077/";

export async function apiFetch<T>(
  endpoint: string,
  method: string = "GET",
  headers: Record<string, string> = {},
  body?: any
): Promise<T> {
  
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...headers
  };

  const rawUser = sessionStorage.getItem("user");
  if (rawUser) {
    const user = JSON.parse(rawUser);
    if (user?.[0]?.CODUSUARIO && user?.password) {
      const authString = `${user[0].CODUSUARIO}:${user.password}`;
      finalHeaders["Authorization"] = "Basic " + btoa(authString);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let errorData;
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : { message: `HTTP error! status: ${response.status}` };
    } catch {
      errorData = { message: `HTTP error! status: ${response.status}` };
    }
    
    const error: any = new Error(errorData.message || `HTTP error! status: ${response.status}`);
    error.response = {
      status: response.status,
      data: errorData
    };
    throw error;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (null as T);
}