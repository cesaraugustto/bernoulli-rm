import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { requestPasswordRecovery, changePasswordWithToken, validatePasswordStrength } from "../services/passwordService";
import type { PasswordRecoveryRequest, ChangePasswordWithTokenRequest } from "../services/passwordService";

interface ForgotPasswordModalProps {
    show: boolean;
    onHide: () => void;
}

interface FormData {
    userId: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
}

interface ValidationErrors {
    userId?: string;
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
}

type ActionType = "request_token" | "reset_with_token";

export default function ForgotPasswordModal({ show, onHide }: ForgotPasswordModalProps) {
    const [formData, setFormData] = useState<FormData>({
        userId: "",
        token: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [actionType, setActionType] = useState<ActionType>("request_token");

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        if (!formData.userId || formData.userId.trim() === "") {
            newErrors.userId = "Código de usuário ou email é obrigatório";
        } else if (formData.userId.trim().length < 3) {
            newErrors.userId = "Código deve ter pelo menos 3 caracteres";
        }

        if (actionType === "reset_with_token") {
            if (!formData.token || formData.token.trim() === "") {
                newErrors.token = "Token é obrigatório";
            }

            if (!formData.newPassword) {
                newErrors.newPassword = "Nova senha é obrigatória";
            } else {
                const passwordErrors = validatePasswordStrength(formData.newPassword);
                if (passwordErrors.length > 0) {
                    newErrors.newPassword = passwordErrors.join(", ");
                }
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Confirmação de senha é obrigatória";
            } else if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = "Senhas não coincidem";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleActionTypeChange = (newActionType: ActionType) => {
        setActionType(newActionType);
        setErrors({});
        setFormData(prev => ({
            ...prev,
            token: "",
            newPassword: "",
            confirmPassword: ""
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            if (actionType === "request_token") {
                const requestData: PasswordRecoveryRequest = {
                    userId: formData.userId.trim()
                };

                await requestPasswordRecovery(requestData);
                setSuccessMessage("As instruções para recuperar sua senha foram enviadas para o email cadastrado. Verifique sua caixa de entrada e spam.");
                setShowSuccess(true);

            } else if (actionType === "reset_with_token") {
                const tokenData: ChangePasswordWithTokenRequest = {
                    lastPassword: formData.token.trim(),
                    newPassword: formData.newPassword,
                    confirmationPassword: formData.confirmPassword
                };
                await changePasswordWithToken(formData.userId.trim(), tokenData);
                setSuccessMessage("Senha alterada com sucesso! Você já pode fazer login com sua nova senha.");
                setShowSuccess(true);

                setTimeout(() => {
                    setShowSuccess(false);
                    handleClose();
                }, 5000);
            }

        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("não encontrado") ||
                    error.message.includes("Not Found") ||
                    error.message.includes("404")) {
                    setErrors({
                        userId: "Usuário não encontrado. Verifique o código informado"
                    });
                } else if (error.message.includes("Token") && error.message.includes("inválido")) {
                    setErrors({
                        token: "Token inválido ou expirado"
                    });
                } else if (error.message.includes("Token expirado")) {
                    setErrors({
                        token: "Token expirado. Solicite um novo token"
                    });
                } else if (error.message.includes("critérios")) {
                    setErrors({
                        newPassword: error.message.replace("Nova senha não atende aos critérios: ", "")
                    });
                } else if (error.message.includes("coincidem")) {
                    setErrors({
                        confirmPassword: error.message
                    });
                } else if (error.message.includes("inválido") ||
                    error.message.includes("Bad Request") ||
                    error.message.includes("400")) {
                    if (actionType === "request_token") {
                        setErrors({
                            userId: "Código de usuário ou email inválido"
                        });
                    } else {
                        setErrors({
                            token: "Token inválido ou dados incorretos"
                        });
                    }
                } else if (error.message.includes("muitas tentativas") ||
                    error.message.includes("Too Many Requests") ||
                    error.message.includes("429")) {
                    setErrors({
                        general: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente"
                    });
                } else if (error.message.includes("email") ||
                    error.message.includes("503")) {
                    setErrors({
                        general: "Serviço de email temporariamente indisponível. Tente novamente mais tarde"
                    });
                } else if (error.message.includes("servidor") ||
                    error.message.includes("500")) {
                    setErrors({
                        general: "Erro no servidor. Tente novamente mais tarde"
                    });
                } else {
                    setErrors({
                        general: error.message
                    });
                }
            } else {
                setErrors({
                    general: "Erro inesperado. Tente novamente"
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            userId: "",
            token: "",
            newPassword: "",
            confirmPassword: ""
        });
        setErrors({});
        setShowSuccess(false);
        setActionType("request_token");
        onHide();
    };

    const getPasswordStrengthIndicator = () => {
        if (!formData.newPassword) return null;

        const errors = validatePasswordStrength(formData.newPassword);
        const isValid = errors.length === 0;

        return (
            <div className={`password-strength ${isValid ? 'valid' : 'invalid'}`}>
                <small className={isValid ? 'text-success' : 'text-warning'}>
                    {isValid ? '✓ Senha forte' : `Requisitos: ${errors.join(', ')}`}
                </small>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={handleClose} centered className="forgot-password-modal">
            <Modal.Header closeButton className="modal-header-custom">
                <Modal.Title className="modal-title-custom">
                    🔑 Esqueci Minha Senha
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="modal-body-custom">
                {showSuccess ? (
                    <div className="success-message">
                        <div className="success-icon">
                            {actionType === "request_token" ? "📧" : "✅"}
                        </div>
                        <h5>
                            {actionType === "request_token" ? "Token enviado!" : "Senha alterada!"}
                        </h5>
                        <p>{successMessage}</p>

                        {actionType === "request_token" && (
                            <div className="mt-3">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => {
                                        setShowSuccess(false);
                                        setActionType("reset_with_token");
                                    }}
                                    className="me-2"
                                >
                                    <i className="fas fa-key me-2"></i>
                                    Usar Token Agora
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleClose}
                                >
                                    Fechar
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {errors.general && (
                            <Alert variant="danger" className="mb-3 alert-custom">
                                <strong>Erro:</strong> {errors.general}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="form-label-custom">
                                    Código de Usuário ou Email *
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.userId}
                                    onChange={(e) => handleInputChange("userId", e.target.value)}
                                    className={`form-control-custom ${errors.userId ? 'is-invalid' : ''}`}
                                    placeholder="Digite seu código de usuário ou email"
                                    disabled={isLoading}
                                />
                                {errors.userId && (
                                    <Form.Control.Feedback type="invalid" className="error-feedback">
                                        {errors.userId}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="form-label-custom mb-3">
                                    O que você deseja fazer?
                                </Form.Label>

                                <div className="mb-2">
                                    <Form.Check
                                        type="radio"
                                        id="request-token"
                                        name="actionType"
                                        label="Esqueci minha senha e gostaria de recuperá-la através do meu email cadastrado"
                                        checked={actionType === "request_token"}
                                        onChange={() => handleActionTypeChange("request_token")}
                                        disabled={isLoading}
                                        className="custom-radio"
                                    />
                                </div>

                                <div>
                                    <Form.Check
                                        type="radio"
                                        id="reset-with-token"
                                        name="actionType"
                                        label="Já recebi no meu email o token para redefinir minha senha"
                                        checked={actionType === "reset_with_token"}
                                        onChange={() => handleActionTypeChange("reset_with_token")}
                                        disabled={isLoading}
                                        className="custom-radio"
                                    />
                                </div>
                            </Form.Group>

                            {actionType === "reset_with_token" && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-custom">
                                            Token *
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.token}
                                            onChange={(e) => handleInputChange("token", e.target.value)}
                                            className={`form-control-custom ${errors.token ? 'is-invalid' : ''}`}
                                            placeholder="Cole aqui o token recebido por email"
                                            disabled={isLoading}
                                        />
                                        {errors.token && (
                                            <Form.Control.Feedback type="invalid" className="error-feedback">
                                                {errors.token}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-custom">
                                            Nova Senha *
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                            className={`form-control-custom ${errors.newPassword ? 'is-invalid' : ''}`}
                                            placeholder="Digite sua nova senha"
                                            disabled={isLoading}
                                        />
                                        {getPasswordStrengthIndicator()}
                                        {errors.newPassword && (
                                            <Form.Control.Feedback type="invalid" className="error-feedback">
                                                {errors.newPassword}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="form-label-custom">
                                            Confirmar Nova Senha *
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                            className={`form-control-custom ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                            placeholder="Confirme sua nova senha"
                                            disabled={isLoading}
                                        />
                                        {errors.confirmPassword && (
                                            <Form.Control.Feedback type="invalid" className="error-feedback">
                                                {errors.confirmPassword}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>
                                </>
                            )}

                            <div className="info-text mb-3">
                                {actionType === "request_token" ? (
                                    <p>Clique em "Enviar Solicitação" para receber as instruções de recuperação no seu email.</p>
                                ) : (
                                    <p>Preencha todos os campos com o token recebido por email e sua nova senha.</p>
                                )}
                            </div>
                        </Form>
                    </>
                )}
            </Modal.Body>

            {!showSuccess && (
                <Modal.Footer className="modal-footer-custom">
                    <Button
                        variant="outline-secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="btn-cancel-custom"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="btn-primary-custom"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {actionType === "request_token" ? "Enviando..." : "Alterando..."}
                            </>
                        ) : (
                            <>
                                <i className={`fas ${actionType === "request_token" ? "fa-paper-plane" : "fa-key"} me-2`}></i>
                                {actionType === "request_token" ? "Enviar Solicitação" : "Alterar Senha"}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
}