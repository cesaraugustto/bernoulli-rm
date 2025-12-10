import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../redux/store";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import "../styles/login.scss";
import "../styles/forgotPassword.scss";
import imgLogo from "../assets/images/3.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  return (
    <div className="login-container">
      
      <div className="login-background">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>

      
      <div className="login-card">
        
        <div className="login-header">
          <img src={imgLogo} className="login-logo" alt="Logo" />
          <h1 className="login-title">Bem-vindo</h1>
          <p className="login-subtitle">Faça login para continuar</p>
        </div>

        
        <form onSubmit={handleSubmit} className="login-form">
        
          <div className="input-group">
            <div className="input-icon">
              <i className="fas fa-user"></i>
            </div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Usuário"
              className="login-input"
              required
            />
          </div>

          
          <div className="input-group">
            <div className="input-icon">
              <i className="fas fa-lock"></i>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              className="login-input"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>

          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          
          <button
            type="submit"
            disabled={loading}
            className={`login-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Entrando...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Entrar
              </>
            )}
          </button>
          
          <div className="forgot-password-link">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="forgot-password-btn"
            >
              <i className="fas fa-key"></i>
              Esqueci minha senha
            </button>
          </div>
        </form>

        
        <div className="login-footer">
          <p>© 2025 Bernoulli Educação</p>
          <p>Adaptação ERP Online - Versão 1.1</p>
        </div>
      </div>
      
      <ForgotPasswordModal 
        show={showForgotPasswordModal}
        onHide={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
}