import { apiFetch } from "./api";

export interface ChangePasswordRequest {
    lastPassword: string;
    newPassword: string;
    confirmationPassword: string;
}

export interface ChangePasswordWithTokenRequest {
    lastPassword: string;
    newPassword: string;
    confirmationPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message?: string;
    error?: string;
}

const getCurrentUserId = (): string => {
    try {
        const rawUser = sessionStorage.getItem("user");
        if (!rawUser) {
            throw new Error("Usuário não encontrado na sessão");
        }

        const user = JSON.parse(rawUser);
        return user?.[0]?.CODUSUARIO;

    } catch (error) {
        return "user";
    }
};


export async function changePassword(
    passwordData: ChangePasswordRequest
): Promise<ChangePasswordResponse> {

    if (!passwordData.lastPassword) {
        throw new Error("Senha atual é obrigatória");
    }

    if (!passwordData.newPassword) {
        throw new Error("Nova senha é obrigatória");
    }

    if (passwordData.newPassword !== passwordData.confirmationPassword) {
        throw new Error("Nova senha e confirmação não coincidem");
    }

    const userId = getCurrentUserId();
    const endpoint = `api/framework/v1/users/${encodeURIComponent(userId)}/changePassword`;

    try {
        const response = await apiFetch<ChangePasswordResponse>(
            endpoint,
            "POST",
            {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            passwordData
        );

        if (!response) {
            const rawUser = sessionStorage.getItem("user");
            if (rawUser) {
                const parsedUser = JSON.parse(rawUser);
                parsedUser.password = passwordData.newPassword;
                sessionStorage.setItem("user", JSON.stringify(parsedUser));
            }

            sessionStorage.setItem("savedPass", passwordData.newPassword);
            return { success: true } as ChangePasswordResponse;
        }
        return response;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                throw new Error("Senha atual incorreta");
            }

            if (error.message.includes('400') || error.message.includes('Bad Request')) {
                throw new Error("Dados inválidos. Verifique os requisitos da senha");
            }

            if (error.message.includes('403') || error.message.includes('Forbidden')) {
                throw new Error("Sem permissão para alterar senha");
            }

            if (error.message.includes('404') || error.message.includes('Not Found')) {
                throw new Error("Usuário não encontrado");
            }

            if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
                throw new Error("Erro interno do servidor. Tente novamente mais tarde");
            }
            throw error;
        }
        throw new Error("Erro inesperado ao alterar senha. Tente novamente");
    }
}

export async function changePasswordWithToken(
    userId: string,
    tokenData: ChangePasswordWithTokenRequest
): Promise<ChangePasswordResponse> {

    if (!tokenData.lastPassword) {
        throw new Error("Token é obrigatório");
    }

    if (!tokenData.newPassword) {
        throw new Error("Nova senha é obrigatória");
    }

    if (tokenData.newPassword !== tokenData.confirmationPassword) {
        throw new Error("Nova senha e confirmação não coincidem");
    }

    if (!userId || userId.trim() === "") {
        throw new Error("Código de usuário ou email é obrigatório");
    }

    const passwordErrors = validatePasswordStrength(tokenData.newPassword);
    if (passwordErrors.length > 0) {
        throw new Error(`Nova senha não atende aos critérios: ${passwordErrors.join(", ")}`);
    }

    const endpoint = `api/framework/v1/users/${encodeURIComponent(userId.trim())}/changePasswordWithToken`;
    try {
        const response = await apiFetch<ChangePasswordResponse>(
            endpoint,
            "POST",
            {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            tokenData
        );

        if (!response) {
            return { 
                success: true,
                message: "Senha alterada com sucesso"
            } as ChangePasswordResponse;
        }
        return response;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('400') || error.message.includes('Bad Request')) {
                throw new Error("Token inválido ou dados incorretos");
            }

            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                throw new Error("Token expirado ou inválido");
            }

            if (error.message.includes('404') || error.message.includes('Not Found')) {
                throw new Error("Usuário não encontrado. Verifique o código informado");
            }

            if (error.message.includes('422') || error.message.includes('Unprocessable Entity')) {
                throw new Error("Nova senha não atende aos critérios de segurança");
            }

            if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
                throw new Error("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente");
            }

            if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
                throw new Error("Erro interno do servidor. Tente novamente mais tarde");
            }

            throw error;
        }

        throw new Error("Erro inesperado ao alterar senha. Tente novamente");
    }
}

export function validatePasswordStrength(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 10) {
        errors.push("Mínimo de 10 caracteres");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Deve conter pelo menos uma letra minúscula");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Deve conter pelo menos uma letra maiúscula");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Deve conter pelo menos um número");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Deve conter pelo menos um símbolo especial (!@#$%^&*(),.?\":{}|<>)");
    }

    return errors;
}

export function isPasswordValid(password: string): boolean {
    return validatePasswordStrength(password).length === 0;
}

export interface PasswordRecoveryRequest {
    userId: string;
}

export interface PasswordRecoveryResponse {
    success: boolean;
    message?: string;
}

export async function requestPasswordRecovery(
    recoveryData: PasswordRecoveryRequest
): Promise<PasswordRecoveryResponse> {
    
    if (!recoveryData.userId || recoveryData.userId.trim() === "") {
        throw new Error("Código de usuário ou email é obrigatório");
    }

    const endpoint = `api/framework/v1/users/${encodeURIComponent(recoveryData.userId.trim())}/recoveryPassword`;

    try {
        const response = await apiFetch<PasswordRecoveryResponse>(
            endpoint,
            "POST",
            {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            recoveryData
        );

        if (!response) {
            return { 
                success: true,
                message: "Instruções de recuperação de senha foram enviadas para o email cadastrado"
            } as PasswordRecoveryResponse;
        }

        return response;

    } catch (error) {
        if (error instanceof Error) {
            // Se for erro HTTP com status específico
            if (error.message.includes('400') || error.message.includes('Bad Request')) {
                throw new Error("Código de usuário ou email inválido");
            }

            if (error.message.includes('404') || error.message.includes('Not Found')) {
                throw new Error("Usuário não encontrado. Verifique o código informado");
            }

            if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
                throw new Error("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente");
            }

            if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
                throw new Error("Erro interno do servidor. Tente novamente mais tarde");
            }

            if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
                throw new Error("Serviço de email temporariamente indisponível. Tente novamente mais tarde");
            }
            throw error;
        }

        throw new Error("Erro inesperado ao solicitar recuperação de senha. Tente novamente");
    }
}