import { Modal, Button } from 'react-bootstrap';
import { CheckCircle, XCircle } from 'lucide-react';
import '../styles/responseModal.scss';

interface ResponseModalProps {
    show: boolean;
    onHide: () => void;
    success: boolean;
    message: string;
    details?: any;
}

export default function ResponseModal({ show, onHide, success, message, details }: ResponseModalProps) {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="response-modal"
        >
            <Modal.Header className={success ? 'bg-success-subtle' : 'bg-danger-subtle'}>
                <Modal.Title className="d-flex align-items-center gap-2">
                    {success ? (
                        <>
                            <CheckCircle size={24} className="text-success" />
                            <span className="text-success">Sucesso!</span>
                        </>
                    ) : (
                        <>
                            <XCircle size={24} className="text-danger" />
                            <span className="text-danger">Erro!</span>
                        </>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-2">{message}</p>
                {details && (
                    <div className="api-response-details mt-3 p-3 bg-light rounded">
                        <small className="text-muted">Detalhes da resposta:</small>
                        <pre className="mb-0 mt-2" style={{ fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto' }}>
                            {JSON.stringify(details, null, 2)}
                        </pre>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant={success ? "success" : "danger"}
                    onClick={onHide}
                >
                    {success ? 'Continuar' : 'Entendi'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}