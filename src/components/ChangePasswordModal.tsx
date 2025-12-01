import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { changePassword, validatePasswordStrength } from "../services/passwordService";
import type { ChangePasswordRequest } from "../services/passwordService";
import "../styles/chagePasswordModal.scss";

interface ChangePasswordModalProps {
    show: boolean;
    onHide: () => void;
}

interface FormData {
    lastPassword: string;
    newPassword: string;
    confirmationPassword: string;
}

interface ValidationErrors {
    lastPassword?: string;
    newPassword?: string;
    confirmationPassword?: string;
    general?: string;
}

export default function ChangePasswordModal({ show, onHide }: ChangePasswordModalProps) {
    const [formData, setFormData] = useState<FormData>({
        lastPassword: "",
        newPassword: "",
        confirmationPassword: ""
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const validatePassword = (password: string): string[] => {
        return validatePasswordStrength(password);
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        if (!formData.lastPassword) {
            newErrors.lastPassword = "Senha atual é obrigatória";
        }
        if (!formData.newPassword) {
            newErrors.newPassword = "Nova senha é obrigatória";
        } else {
            const passwordErrors = validatePassword(formData.newPassword);
            if (passwordErrors.length > 0) {
                newErrors.newPassword = "A nova senha não atende a todos os requisitos: " + passwordErrors.join(", ");
            }
        }
        if (!formData.confirmationPassword) {
            newErrors.confirmationPassword = "Confirmação de senha é obrigatória";
        } else if (formData.newPassword !== formData.confirmationPassword) {
            newErrors.confirmationPassword = "As senhas não coincidem";
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({}); 

        try {
            const requestData: ChangePasswordRequest = {
                lastPassword: formData.lastPassword,
                newPassword: formData.newPassword,
                confirmationPassword: formData.confirmationPassword
            };
            await changePassword(requestData);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                handleClose();
            }, 3000);

        } catch (error) {
            let errorMessage = "Erro inesperado. Tente novamente.";
            let fieldError: keyof ValidationErrors | 'general' = 'general';

            if (error instanceof Error) {
                const message = error.message.toLowerCase();
                if (message.includes("senha atual incorreta") || message.includes("atual") || message.includes("401")) {
                    errorMessage = "Senha atual incorreta.";
                    fieldError = 'lastPassword';
                } else if (message.includes("requisitos") || message.includes("inválidos") || message.includes("400")) {
                    errorMessage = "Nova senha não atende aos requisitos de segurança.";
                    fieldError = 'newPassword';
                } else if (message.includes("permissão") || message.includes("403")) {
                    errorMessage = "Você não tem permissão para alterar a senha.";
                } else if (message.includes("não encontrado") || message.includes("404")) {
                    errorMessage = "Usuário não encontrado. Tente fazer login novamente.";
                } else if (message.includes("servidor") || message.includes("500")) {
                    errorMessage = "Erro no servidor. Tente novamente mais tarde.";
                } else {
                    errorMessage = error.message;
                }
            }
            setErrors(prev => ({
                ...prev,
                [fieldError]: errorMessage
            }));

        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            lastPassword: "",
            newPassword: "",
            confirmationPassword: ""
        });
        setErrors({});
        setShowSuccess(false);
        onHide();
    };

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        if (!password) {
            return { strength: 0, label: "Vazio", color: "#adb5bd" };
        }

        let score = 0;
        if (password.length >= 10) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        const maxScore = 5;
        const strength = (score / maxScore) * 100;

        if (score === maxScore) return { strength, label: "Muito forte", color: "#28a745" };
        if (score >= 4) return { strength, label: "Forte", color: "#17a2b8" };
        if (score >= 3) return { strength, label: "Média", color: "#ffc107" };
        if (score >= 2) return { strength, label: "Fraca", color: "#fd7e14" };
        return { strength, label: "Muito fraca", color: "#dc3545" };
    };

    const passwordStrength = formData.newPassword ? getPasswordStrength(formData.newPassword) : null;

    return (
        <Modal show={show} onHide={handleClose} centered className="change-password-modal">
            <Modal.Header closeButton className="modal-header-custom">
                <Modal.Title className="modal-title-custom">
                    🔐 Alterar Senha
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="modal-body-custom">
                {showSuccess ? (
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h5>Senha alterada com sucesso!</h5>
                        <p>Sua senha foi atualizada com segurança.</p>
                        <small>A janela fechará automaticamente.</small>
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
                                    Senha Atual *
                                </Form.Label>
                                <Form.Control
                                    type="password"
                                    value={formData.lastPassword}
                                    onChange={(e) => handleInputChange("lastPassword", e.target.value)}
                                    className={`form-control-custom ${errors.lastPassword ? 'is-invalid' : ''}`}
                                    placeholder="Digite sua senha atual"
                                    disabled={isLoading}
                                    required
                                />
                                {errors.lastPassword && (
                                    <Form.Control.Feedback type="invalid" className="error-feedback">
                                        {errors.lastPassword}
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
                                    required
                                />
                                {errors.newPassword && (
                                    <Form.Control.Feedback type="invalid" className="error-feedback">
                                        {errors.newPassword}
                                    </Form.Control.Feedback>
                                )}

                                {passwordStrength && (
                                    <div className="password-strength-container">
                                        <div className="password-strength-bar">
                                            <div
                                                className="password-strength-fill"
                                                style={{
                                                    width: `${passwordStrength.strength}%`,
                                                    backgroundColor: passwordStrength.color
                                                }}
                                                aria-valuenow={passwordStrength.strength}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                role="progressbar"
                                                title={`Força: ${passwordStrength.label}`}
                                            />
                                        </div>
                                        <small
                                            className="password-strength-label"
                                            style={{ color: passwordStrength.color }}
                                        >
                                            Força: {passwordStrength.label}
                                        </small>
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="form-label-custom">
                                    Confirmar Nova Senha *
                                </Form.Label>
                                <Form.Control
                                    type="password"
                                    value={formData.confirmationPassword}
                                    onChange={(e) => handleInputChange("confirmationPassword", e.target.value)}
                                    className={`form-control-custom ${errors.confirmationPassword ? 'is-invalid' : ''}`}
                                    placeholder="Confirme sua nova senha"
                                    disabled={isLoading}
                                    required
                                />
                                {errors.confirmationPassword && (
                                    <Form.Control.Feedback type="invalid" className="error-feedback">
                                        {errors.confirmationPassword}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>

                            <div className="password-requirements">
                                <h6>Requisitos da senha:</h6>
                                <ul>
                                    <li className={formData.newPassword.length >= 10 ? 'valid' : ''}>
                                        Mínimo de 10 caracteres
                                    </li>
                                    <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                                        Pelo menos uma letra minúscula
                                    </li>
                                    <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                                        Pelo menos uma letra maiúscula
                                    </li>
                                    <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                                        Pelo menos um número
                                    </li>
                                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'valid' : ''}>
                                        Pelo menos um símbolo especial
                                    </li>
                                </ul>
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
                        disabled={isLoading || !formData.lastPassword || !formData.newPassword || !formData.confirmationPassword}
                        className="btn-primary-custom"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Alterando...
                            </>
                        ) : (
                            "Alterar Senha"
                        )}
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
}
