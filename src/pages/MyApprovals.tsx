import { useState, useEffect } from 'react';
import { Row, Col, Alert, Button, Badge, Modal, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '../components/Table';
import '../styles/dashboard.scss';
import { useDispatch, useSelector } from "react-redux";
import { setPageTitle } from "../redux/slices/pageTitleSlice";
import { setPageSubtitle } from '../redux/slices/pageSubtitleSlice';
import { getUserApproves, getApprovesDetail, stepForwardTicket, getTicketDetails } from '../services/approvalsService';
import { CheckCircle, XCircle, GitPullRequest, Building2, Hash, CalendarDays, User, UserCheck, Bolt } from 'lucide-react';
import type { RootState } from '../redux/store';
import { createPortal } from "react-dom";
import '../styles/productModal.scss';
import ResponseModal from '../components/ResponseModal';

interface Approval {
    CODCOLIGADA: number;
    CODLOCAL: number;
    CODATENDIMENTO: number;
    CODATENDENTE: number;
    CODCOLIGADARESP: number;
    ABERTURA: string;
    NOME: string;
    SOLICITANTE: string;
    APROVADOR: string;
}

interface StepCodes {
    nextStepCode: number;
    flowsStepCode: number;
}

export default function Approvals() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(setPageTitle("Minhas aprovações ✅"));
        dispatch(setPageSubtitle("Aprove solicitações pendentes"));
    }, [dispatch]);

    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
    const [approvalDetail, setApprovalDetail] = useState<any[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [ticketDetails, setTicketDetails] = useState<any>(null);
    const [loadingTicketDetails, setLoadingTicketDetails] = useState(false);
    const [processingAction, setProcessingAction] = useState(false);
    const [showRejectAlert, setShowRejectAlert] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [alertData, setAlertData] = useState({
        ticket: '',
        coligada: '',
        local: ''
    });
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [apiResponse, setApiResponse] = useState<{
        success: boolean;
        message: string;
        details?: any;
    }>({ success: false, message: '', details: null });

    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        loadApprovals();
    }, []);

    const loadApprovals = async () => {
        try {
            setLoading(true);
            setError(null);

            const rawUser = sessionStorage.getItem('user');
            const sessionUser = rawUser ? JSON.parse(rawUser) : null;

            if (!sessionUser?.[0]?.CODUSUARIO) {
                throw new Error('Usuário não autenticado');
            }

            const response = await getUserApproves(sessionUser[0].CODUSUARIO);
            let approvalsData: Approval[] = [];

            if (Array.isArray(response)) {
                approvalsData = response;
            } else if (response && typeof response === 'object') {
                approvalsData = response.data || response.approvals || response.items || [response];
            } else {
                console.warn('Formato de dados inesperado:', response);
                approvalsData = [];
            }
            setApprovals(approvalsData);
        } catch (err) {
            setError('Erro ao carregar os dados das aprovações. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const getStepCodes = (taskCode: number, isApproved: boolean): StepCodes | null => {
        const stepMapping: Record<number, { approved: StepCodes; rejected: StepCodes }> = {
            214: {
                approved: { nextStepCode: 215, flowsStepCode: 280 },
                rejected: { nextStepCode: 176, flowsStepCode: 287 }
            },
            215: {
                approved: { nextStepCode: 216, flowsStepCode: 281 },
                rejected: { nextStepCode: 176, flowsStepCode: 288 }
            },
            216: {
                approved: { nextStepCode: 217, flowsStepCode: 282 },
                rejected: { nextStepCode: 176, flowsStepCode: 289 }
            },
            217: {
                approved: { nextStepCode: 218, flowsStepCode: 283 },
                rejected: { nextStepCode: 176, flowsStepCode: 290 }
            },
            218: {
                approved: { nextStepCode: 219, flowsStepCode: 284 },
                rejected: { nextStepCode: 176, flowsStepCode: 291 }
            },
            219: {
                approved: { nextStepCode: 220, flowsStepCode: 285 },
                rejected: { nextStepCode: 176, flowsStepCode: 292 }
            },
            220: {
                approved: { nextStepCode: 175, flowsStepCode: 286 },
                rejected: { nextStepCode: 176, flowsStepCode: 293 }
            }
        };

        const mapping = stepMapping[taskCode];
        if (!mapping) {
            console.error(`❌ TaskCode ${taskCode} não encontrado no mapeamento de etapas`);
            return null;
        }

        return isApproved ? mapping.approved : mapping.rejected;
    };

    const handleOpenDetail = async (approval: Approval) => {
        setSelectedApproval(approval);
        setShowDetailModal(true);
        setLoadingDetail(true);
        setLoadingTicketDetails(true);

        try {
            // Buscar detalhes do aprovador (tabela)
            const response = await getApprovesDetail(approval.CODCOLIGADA, approval.CODATENDIMENTO);
            let detailData: any[] = [];
            if (Array.isArray(response)) {
                detailData = response;
            } else if (response && typeof response === 'object') {
                detailData = response.data || response.details || response.items || [response];
            }
            setApprovalDetail(detailData);
        } catch (err) {
            setApprovalDetail([]);
        } finally {
            setLoadingDetail(false);
        }

        try {
            // Buscar detalhes do ticket (etapa atual e outras informações)
            const ticketResponse = await getTicketDetails(
                approval.CODCOLIGADA,
                approval.CODLOCAL,
                approval.CODATENDIMENTO
            );
            setTicketDetails(ticketResponse);
            console.log('🎯 DETALHES DO TICKET:', ticketResponse);
            console.log('📋 TaskCode atual:', ticketResponse?.taskCode);
        } catch (err) {
            console.error('❌ Erro ao buscar detalhes do ticket:', err);
            setTicketDetails(null);
        } finally {
            setLoadingTicketDetails(false);
        }
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedApproval(null);
        setApprovalDetail([]);
        setTicketDetails(null);
    };

    const handleApprove = async (approval: Approval, comments: string = '') => {
        try {
            setProcessingAction(true);

            // Verificar se temos os detalhes do ticket
            if (!ticketDetails || !ticketDetails.taskCode) {
                alert('❌ Erro: Não foi possível obter as informações da etapa atual. Tente novamente.');
                return;
            }

            // Obter os códigos corretos baseado no taskCode atual
            const stepCodes = getStepCodes(ticketDetails.taskCode, true);

            if (!stepCodes) {
                alert(`❌ Erro: Etapa atual (${ticketDetails.taskCode}) não reconhecida. Entre em contato com o suporte.`);
                return;
            }

            console.log('✅ Aprovando com códigos:', stepCodes);

            const payload = {
                id: `${approval.CODCOLIGADA}|${approval.CODLOCAL}|${approval.CODATENDIMENTO}`,
                companyId: approval.CODCOLIGADA,
                locationId: approval.CODLOCAL,
                ticketId: approval.CODATENDIMENTO,
                nextStepCode: stepCodes.nextStepCode,
                flowsStepCode: stepCodes.flowsStepCode,
                comments: comments || 'Aprovado via sistema',
                stepSolution: comments || 'Aprovado'
            };

            const response = await stepForwardTicket(payload);

            setApiResponse({
                success: true,
                message: 'Requisição enviada com sucesso!',
                details: response
            });
            setShowResponseModal(true);


        } catch (err) {
            alert(
                `✖ ERRO AO PROCESSAR A APROVAÇÃO\n\n` +
                `Verifique sua conexão ou tente novamente em instantes.`
            );
        } finally {
            setProcessingAction(false);
        }
    };


    const handleReject = async (approval: Approval, comments: string = '') => {
        try {
            setProcessingAction(true);

            if (!ticketDetails || !ticketDetails.taskCode) {
                alert('❌ Erro: Não foi possível obter as informações da etapa atual. Tente novamente.');
                return;
            }

            const stepCodes = getStepCodes(ticketDetails.taskCode, false);

            if (!stepCodes) {
                alert(`❌ Erro: Etapa atual (${ticketDetails.taskCode}) não reconhecida. Entre em contato com o suporte.`);
                return;
            }

            const payload = {
                id: `${approval.CODCOLIGADA}|${approval.CODLOCAL}|${approval.CODATENDIMENTO}`,
                companyId: approval.CODCOLIGADA,
                locationId: approval.CODLOCAL,
                ticketId: approval.CODATENDIMENTO,
                nextStepCode: stepCodes.nextStepCode,
                flowsStepCode: stepCodes.flowsStepCode,
                comments: comments || 'Rejeitado via sistema',
                stepSolution: comments || 'Rejeitado'
            };

            const response = await stepForwardTicket(payload);

            setApiResponse({
                success: true,
                message: 'Requisição rejeitada com sucesso!',
                details: response
            });
            setShowResponseModal(true);

        } catch (err) {
            alert('Erro ao processar rejeição. Tente novamente.');
        } finally {
            setProcessingAction(false);
        }
    };


    const handleCloseResponseModal = () => {
        setShowResponseModal(false);
        if (apiResponse.success) {
            navigate(0);
        }
    };

    const handleApprovalSelection = (id: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedApprovals(prev => [...prev, id]);
        } else {
            setSelectedApprovals(prev => prev.filter(approvalId => approvalId !== id));
        }
    };

    const columns: Column[] = [
        {
            key: 'CODATENDIMENTO',
            header: 'Código',
            sortable: true,
            width: '120px',
            render: (value: string) => (
                <code className="bg-light px-2 py-1 rounded">{value}</code>
            )
        },
        {
            key: 'CODCOLIGADA',
            header: 'Coligada',
            sortable: true,
            width: '100px',
            render: (value: string) => (
                <Badge bg="primary">{value}</Badge>
            )
        },
        {
            key: 'ABERTURA',
            header: 'Data de Abertura',
            sortable: true,
            width: '180px',
            render: (value: string) => {
                const date = new Date(value);
                return (
                    <span>
                        {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                );
            }
        },
        {
            key: 'SOLICITANTE',
            header: 'Solicitante',
            sortable: true,
            render: (value: string) => (
                <span className="fw-medium">{value}</span>
            )
        },
        {
            key: 'actions',
            header: 'Ações',
            sortable: false,
            width: '80px',
            render: (_value: string, row: Approval) => (
                <div className="d-flex justify-content-center">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleOpenDetail(row)}
                        title="Ver detalhes"
                    >
                        🔍
                    </Button>
                </div>
            )
        }
    ];




    return (
        <>














        
            <Row className="m-0">
                <Col>
                    {error && (
                        <Alert variant="danger" className="d-flex align-items-center gap-2">
                            ⚠️ {error}
                        </Alert>
                    )}

                    {!loading && approvals.length === 0 && !error ? (
                        <div className="card p-3 "  style={{ width: "100%", height: "70vh", boxShadow: "8px 8px 15px rgba(0,0,0,0.3)"}}>
                            <div className="text-center py-5">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                <h5 className="text-muted mb-2">Nenhuma aprovação pendente</h5>
                                <p className="text-muted">
                                    Você não possui aprovações pendentes no momento.
                                    <br />
                                    Quando houver solicitações para aprovar, elas aparecerão aqui!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <DataTable
                            data={approvals}
                            columns={columns}
                            loading={loading}
                            itemsPerPage={15}
                            searchable={true}
                            className="approvals-table"
                        />
                    )}
                </Col >

                < Modal
                    show={showDetailModal}
                    onHide={handleCloseDetail}
                    size="lg"

                    className="product-modal"
                >
                    <Modal.Header closeButton className="border-0">
                        {selectedApproval && (
                            <div className="header-content">
                                <div className="product-icon">
                                    <GitPullRequest size={36} />
                                </div>
                                <div className="header-text">
                                    <div className="product-info pe-2 mt-0 mb-0 pb-0">
                                        <strong><span className="product-name">Detalhes da Requisição</span></strong>
                                    </div>
                                    <Modal.Title className="d-flex justify-content-start mt-0 pt-0">
                                        <Badge bg="primary" className="">
                                            {selectedApproval.CODATENDIMENTO}
                                        </Badge>
                                    </Modal.Title>
                                </div>
                            </div>
                        )}
                    </Modal.Header>
                    <Modal.Body>
                        {selectedApproval && (
                            <>
                                <Row className="summary-card pb-1">
                                    <Col md={2} lg={3}>
                                        <div className="summary-item d-flex justify-content-start align-items-start">
                                            <Building2 size={20} />
                                            <div>
                                                <span className="summary-label">Coligada:</span>
                                                <strong>{selectedApproval.CODCOLIGADA}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={2} lg={4}>
                                        <div className="summary-item d-flex justify-content-start align-items-start">
                                            <CalendarDays size={20} />
                                            <div className="">
                                                <span className="summary-label">Data de Abertura:</span>
                                                <strong><div>{new Date(selectedApproval.ABERTURA).toLocaleString('pt-BR')}</div></strong>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="summary-card">
                                    <Col md={2} lg={3}>
                                        <div className="summary-item d-flex justify-content-start align-items-start">
                                            <User size={20} />
                                            <div>
                                                <span className="summary-label">Solicitante:</span>
                                                <strong><div >{selectedApproval.SOLICITANTE}</div></strong>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={2} lg={3}>
                                        <div className="summary-item d-flex justify-content-start align-items-start">
                                            <UserCheck size={20} />
                                            <div>
                                                <span className="summary-label">Aprovador:</span>
                                                <strong><div>{selectedApproval.APROVADOR}</div></strong>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={2} lg={4}>
                                        <div className="summary-item d-flex justify-content-start align-items-start">
                                            <Bolt size={20} />
                                            <div>
                                                <span className="summary-label">Movimento:</span>
                                                <strong><div>{selectedApproval.NOME}</div></strong>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <div>
                                    {loadingDetail && (
                                        <div className="text-center py-3">
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Carregando detalhes...
                                        </div>
                                    )}

                                    {!loadingDetail && approvalDetail.length > 0 && (
                                        <div className="mt-3">
                                            <Table hover className="modern-table mb-0 mx-1">
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            Descrição
                                                        </th>
                                                        <th>
                                                            Valor
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {approvalDetail.map((item, idx) => (
                                                        <tr key={idx} className="table-row">
                                                            <td className="w-75">
                                                                <span className="table-cell-content">
                                                                    {item.HISTORICO}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="table-cell-content">
                                                                    {item.VALOR}
                                                                </span>
                                                            </td>

                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>

                                            {!loadingDetail && approvalDetail.length === 0 && (
                                                <Alert variant="info" className="mt-3">
                                                    <strong>ℹ️ Informação:</strong> Nenhum detalhe adicional disponível para esta aprovação.
                                                </Alert>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                    </Modal.Body>
                    <Modal.Footer className="border-0 m-0">
                        <Button
                            variant="danger"
                            onClick={() => selectedApproval && handleReject(selectedApproval)}
                            disabled={processingAction || loadingTicketDetails}
                            className="modern-btn"
                        >
                            {processingAction ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <XCircle size={16} className="me-1" />
                                    Rejeitar
                                </>
                            )}
                        </Button>
                        <Button
                            variant="success"
                            onClick={() => selectedApproval && handleApprove(selectedApproval)}
                            disabled={processingAction || loadingTicketDetails}
                            className="modern-btn procceed-btn"
                        >
                            {processingAction ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} className="me-1" />
                                    Aprovar
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal >
            </Row >

























            <ResponseModal
                show={showResponseModal}
                onHide={handleCloseResponseModal}
                success={apiResponse.success}
                message={apiResponse.message}
                details={apiResponse.details}
            />


            {showSuccessAlert &&
                createPortal(
                    <div
                        className="position-fixed top-50 start-50 translate-middle"
                        style={{
                            zIndex: 999999,
                            minWidth: "420px"
                        }}
                    >
                        <Alert
                            variant="primary"
                            className="shadow-lg border-0 p-4 text-center"
                            style={{ fontSize: "1.1rem" }}
                            onClose={() => {
                                setShowSuccessAlert(false);
                            }}
                            dismissible
                        >
                            <h4 className="mb-3">✔ Aprovação realizada!</h4>
                            <p className="mb-1"><strong>Atendimento:</strong> {alertData.ticket}</p>
                            <p className="mb-1"><strong>Coligada:</strong> {alertData.coligada}</p>
                            <p className="mb-3"><strong>Local:</strong> {alertData.local}</p>

                            <div className="fw-bold">A solicitação foi avançada para a próxima etapa.</div>
                        </Alert>
                    </div>,
                    document.body
                )
            }


            {
                showRejectAlert &&
                createPortal(
                    <div
                        className="position-fixed top-50 start-50 translate-middle"
                        style={{
                            zIndex: 999999,
                            minWidth: "420px"
                        }}
                    >
                        <Alert
                            variant="danger"
                            className="shadow-lg border-0 p-4 text-center"
                            style={{ fontSize: "1.1rem" }}
                            onClose={() => {
                                setShowRejectAlert(false);
                            }}
                            dismissible
                        >
                            <h4 className="mb-3">✔ Aprovação rejeitada!</h4>

                            <p className="mb-1"><strong>Atendimento:</strong> {alertData.ticket}</p>
                            <p className="mb-1"><strong>Coligada:</strong> {alertData.coligada}</p>
                            <p className="mb-3"><strong>Local:</strong> {alertData.local}</p>

                            <div className="fw-bold">A solicitação foi rejeitada para a próxima etapa.</div>
                        </Alert>
                    </div>,
                    document.body
                )
            }
        </>
    );
}