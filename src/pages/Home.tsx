import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.scss";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setPageTitle } from "../redux/slices/pageTitleSlice";
import { setPageSubtitle } from "../redux/slices/pageSubtitleSlice";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Início 🏠"));
    dispatch(setPageSubtitle("Todas as funções do sistema"));
  }, [dispatch]);

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <>
      <Row className="my-3 px-2">
        <div className="text-system">TOTVS GESTÃO DE ESTOQUE COMPRAS E FATURAMENTO</div>
        <hr className="mx-2"></hr>
        <Col className="pe-3 col-3">
          <div
            className="stats-card clickable"
            onClick={() => handleCardClick('/products')}
          >
            <div className="stats-number">Requisições</div>
            <div className="stats-label">Detalhes de produtos e requisições</div>
          </div>
        </Col>
        <Col className="ps-0 col-3">
          <div
            className="stats-card clickable"
            onClick={() => handleCardClick('/user-requests')}
          >
            <div className="stats-number">Solicitações</div>
            <div className="stats-label">Meu histórico de solicitações</div>
          </div>
        </Col>
      </Row>

      <Row className="mt-5 px-2">
        <div className="text-system">TOTVS APROVAÇÕES E ATENDIMENTOS</div>
        <hr className="mx-2"></hr>

        <Col className="pe-3 col-3">
          <div
            className="stats-card clickable"
            onClick={() => handleCardClick('/minhas-aprovacoes')}
          >
            <div className="stats-number">Aprovações</div>
            <div className="stats-label">Aprove solicitações em massa</div>
          </div>
        </Col>
      </Row>
      {/* 
      <Row className="mt-5 px-2">
        <div className="text-system">TOTVS SEGURANÇA E SAÚDE OPERACIONAL</div>
        <hr className="mx-2"></hr>

        <Col className="pe-3 col-3">
          <div className="stats-card disabled position-relative">
            <div className="coming-soon">Em breve</div>

            <div className="stats-number">CIPA</div>
            <div className="stats-label">Efetue seu voto!</div>
          </div>
        </Col>

      </Row>
      */}
    </>
  );
}