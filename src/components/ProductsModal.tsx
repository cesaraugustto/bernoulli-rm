import { useEffect, useState } from 'react';
import { Modal, Button, Table, Spinner, Badge } from 'react-bootstrap';
import { Package, MapPin, Building2, Scale } from 'lucide-react';
import '../styles/productModal.scss';
import { getProductsDetails } from '../services/productsService';

interface ProductModalProps {
    show: boolean;
    onClose: () => void;
    CODIGOPRD: string;
}

interface ProductDetail {
    CODCOLIGADA: number;
    CODFILIAL: number;
    CODLOC: string;
    SALDOFISICO2: number;
    CODIGOPRD?: string;
    DESCRICAO?: string;
}

export default function ProductModal({ show, onClose, CODIGOPRD }: ProductModalProps) {
    const [details, setDetails] = useState<ProductDetail[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setLoading(true);
            getProductsDetails(CODIGOPRD)
                .then((res: ProductDetail[]) => setDetails(res))
                .finally(() => setLoading(false));
        } else {
            setDetails([]);
        }
    }, [show, CODIGOPRD]);

    const totalSaldo = details.reduce((sum, item) => sum + item.SALDOFISICO2, 0);

    return (
        <Modal show={show} onHide={onClose} size="lg" className="product-modal">
            <Modal.Header closeButton className="border-0">
                <div className="header-content">
                    <div className="product-icon">
                        <Package size={24} />
                    </div>
                    <div className="header-text">
                        <Modal.Title className="mb-1">
                            <Badge bg="primary" className="">
                                Código: {CODIGOPRD}
                            </Badge>
                        </Modal.Title>
                        {details.length > 0 && (
                            <div className="product-info pe-2">
                                <span className="product-name">{details[0].DESCRICAO}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="p-0">
                {loading ? (
                    <div className="loading-container">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 mb-0">Carregando detalhes...</p>
                    </div>
                ) : details.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">Nenhum detalhe encontrado</h5>
                        <p className="text-muted mb-0">
                            Produto não disponível em estoque.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="summary-card">
                            <div className="summary-item d-flex justify-content-start align-items-start">
                                <Building2 size={20} />
                                <div>
                                    <span className="summary-label">Locais de Estoque</span>
                                    <span className="summary-value">{details.length}</span>
                                </div>
                            </div>
                            <div className="summary-item d-flex justify-content-start align-items-start">
                                <Scale size={20} />
                                <div>
                                    <span className="summary-label">Saldo Total</span>
                                    <span className="summary-value">{totalSaldo.toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="table-container">
                            <Table hover className="modern-table mb-0">
                                <thead>
                                    <tr>
                                        <th>
                                            Coligada
                                        </th>
                                        <th>
                                            Filial
                                        </th>
                                        <th>
                                            Local
                                        </th>
                                        <th >
                                            Saldo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details.map((item, idx) => (
                                        <tr key={idx} className="table-row">
                                            <td>
                                                <span className="table-cell-content">
                                                    {item.CODCOLIGADA}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="table-cell-content">
                                                    {item.CODFILIAL}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="table-cell-content">
                                                    {item.CODLOC}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <Badge
                                                    bg={item.SALDOFISICO2 > 0 ? 'primary' : 'danger'}
                                                    className="saldo-badge"
                                                >
                                                    {item.SALDOFISICO2.toLocaleString('pt-BR')}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer className="border-0 m-0">
            </Modal.Footer>
        </Modal>
    );
}