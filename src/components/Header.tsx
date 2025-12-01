import { useDispatch, useSelector } from "react-redux";
import { logout as logoutService } from "../services/authService";
import { logout as logoutAction } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../redux/store";
import { Dropdown, Row, Col, Button } from "react-bootstrap";
import imgLogo from "../assets/images/1.png";
import { useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";
import '../styles/header.scss';

export default function Header() {
    const dispatch = useDispatch();
    const title = useSelector((state: RootState) => state.pageTitle.title);
    const subTitle = useSelector((state: RootState) => state.pageSubtitle.title);

    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);

    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const handleLogout = () => {
        logoutService();
        sessionStorage.removeItem("user");
        dispatch(logoutAction());
        navigate("/login");
    };

    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        const first = parts[0]?.[0] ?? "";
        const last = parts[parts.length - 1]?.[0] ?? "";
        return (first + last).toUpperCase();
    };

    const handleChangePassword = () => {
        setShowChangePasswordModal(true);
    };

    return (
        <>
            <header className="app-header text-white p-2">
                <Row className="w-100">
                    <Col xs={8} sm={2} className="d-flex justify-content-start align-items-center m-0" style={{ position: 'relative' }}>
                        <img src={imgLogo} className="img-logo-header" />
                    </Col>
                    <Col xs={8} sm={8} className="d-none d-sm-block m-0 ps-3 pe-0">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div>
                                    <h2 className="mb-0 h3">{title}</h2>
                                    <p className="text-white mb-0">{subTitle}</p>
                                </div>
                            </div>

                            {location.pathname !== '/' && (
                                <Button
                                    variant="outline-light"
                                    size="sm"
                                    className="back-button"
                                    onClick={() => navigate("/")}
                                    title="Voltar para Home"
                                >
                                    <span className="back-icon">🔙</span>
                                    Voltar
                                </Button>
                            )}
                        </div>
                    </Col>

                    <Col
                        xs={4}
                        sm={3}
                        md={2}
                        className="d-flex justify-content-end align-items-start m-0 p-0"
                    >
                        <div className="profile-container d-flex align-items-center">
                            <span className="welcome-text me-2">
                                <span className="welcome-greeting">Bem-vindo(a),</span>
                                <strong className="user-name">{user?.[0]?.CODUSUARIO ?? "Usuário"}</strong>
                            </span>

                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="link"
                                    bsPrefix="p-0 border-0 bg-transparent"
                                >
                                    <div
                                        className="user-avatar rounded-circle bg-white text-primary d-flex align-items-center justify-content-center"
                                    >
                                        {getInitials(user?.[0]?.NOME ?? "")}
                                    </div>
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="profile-dropdown-menu">
                                    <Dropdown.Header className="profile-dropdown-header">
                                        {user?.[0]?.NOME ?? "Usuário"}
                                    </Dropdown.Header>
                                    <Dropdown.Item disabled className="profile-dropdown-email">
                                        {user?.[0]?.EMAIL ?? "sem e-mail"}
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={handleChangePassword} className="profile-dropdown-item">
                                        <span>🔐 Alterar senha</span>
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout} className="profile-dropdown-item logout-item">
                                        🚪 Sair
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Col>
                </Row>
            </header>

            <ChangePasswordModal 
                show={showChangePasswordModal}
                onHide={() => setShowChangePasswordModal(false)}
            />
        </>
    );
}