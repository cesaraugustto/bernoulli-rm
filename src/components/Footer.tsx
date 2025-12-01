import { Row } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="app-footer d-flex align-items-center justify-content-center">
      <div className="text-center">
        <Row className="">
          <span className="text-white"><i className="fas fa-heart text-danger"></i> Adaptação ERP Online - Versão 1.1 | © 2025 Bernoulli Educação</span>
        </Row>
      </div>
    </footer>
  );
}