import type { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/layout.scss";
import { Row, Col } from "react-bootstrap";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="app-container">
            <div className="app-background">
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
                <div className="particle particle-5"></div>
                <div className="particle particle-6"></div>
                <div className="particle particle-7"></div>
                <div className="particle particle-8"></div>
                <div className="particle particle-9"></div>
                <div className="particle particle-10"></div>
            </div>

            <div className="header-wrapper">
                <Header />
            </div>

            <main className="app-content">
                <Row className="content-row">
                    <Col xs={0} sm={2} className="d-none d-sm-block m-0 p-0 sidebar-col">
                        <div className="sidebar-decoration left">
                            <div className="decoration-particle"></div>
                            <div className="decoration-particle"></div>
                            <div className="decoration-particle"></div>
                        </div>
                    </Col>

                    <Col xs={12} sm={8} className="p-0 m-0 main-col">
                        <div className="content-wrapper">
                            {children}
                        </div>
                    </Col>

                    <Col xs={0} sm={2} className="d-none d-sm-block m-0 sidebar-col">
                        <div className="sidebar-decoration right">
                            <div className="decoration-particle"></div>
                            <div className="decoration-particle"></div>
                            <div className="decoration-particle"></div>
                        </div>
                    </Col>
                </Row>
            </main>

            <div className="footer-wrapper">
                <Footer />
            </div>
        </div>
    );
}