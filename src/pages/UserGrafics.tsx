import { useState, useEffect } from 'react';
import { Card, Spinner, Modal, Button, Badge } from 'react-bootstrap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getUserScByGroup, getUserScByMonth, getUserRequest } from '../services/userService';
import { useDispatch, useSelector } from 'react-redux';
import { setPageSubtitle } from '../redux/slices/pageSubtitleSlice';
import { setPageTitle } from '../redux/slices/pageTitleSlice';
import type { RootState } from '../redux/store';
import { DataTable, type Column } from '../components/Table';
import '../styles/userGraphics.scss';
import '../styles/productModal.scss';

interface ApiData {
    ANO: string;
    MES: string;
    TOTALSOLICITACOES: number;
}

interface ChartData {
    period: string;
    quantidade: number;
}

export default function UserSolicitacoesChart() {
    const dispatch = useDispatch();
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthDetails, setMonthDetails] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [loadingRequest, setLoadingRequest] = useState(false);
    const [requestItems, setRequestItems] = useState<any[]>([]);
    const [selectedMov, setSelectedMov] = useState<{ CODCOLIGADA?: string; IDMOV?: string } | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("");
    const user = useSelector((state: RootState) => state.auth.user[0].CODUSUARIO);
    const [ano, setAno] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        dispatch(setPageTitle("Gráficos 📊"));
        dispatch(setPageSubtitle("Confira seu histórico de solicitações"));
    }, [dispatch]);

    const loadData = async (anoParam: number) => {
        setLoading(true);
        try {
            const response: ApiData[] = await getUserScByGroup(user, anoParam);

            const monthOrder: { [key: string]: number } = {
                January: 1, February: 2, March: 3, April: 4,
                May: 5, June: 6, July: 7, August: 8,
                September: 9, October: 10, November: 11, December: 12
            };

            const sorted = response.sort((a, b) => {
                if (a.ANO !== b.ANO) return Number(a.ANO) - Number(b.ANO);
                return (monthOrder[a.MES] || 0) - (monthOrder[b.MES] || 0);
            });

            setChartData(sorted.map(item => ({
                period: `${item.MES.substring(0, 3)}/${item.ANO}`,
                quantidade: item.TOTALSOLICITACOES
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = async (row: any) => {
        const idMov = row.IDMOV ?? row.idmov ?? row.IDMOV?.toString() ?? row.NUMEROMOV;
        const codColigada = row.CODCOLIGADA ?? row.codcoligada ?? row.CODCOLIGADA?.toString() ?? row.CODCOLIGADA;
        if (!idMov || !codColigada) return;

        setSelectedMov({ CODCOLIGADA: row.CODCOLIGADA, IDMOV: idMov });
        setShowRequestModal(true);
        setLoadingRequest(true);
        try {
            const resp = await getUserRequest(idMov, codColigada);
            setRequestItems(Array.isArray(resp) ? resp : (resp?.data ?? []));
        } catch (err) {
            setRequestItems([]);
        } finally {
            setLoadingRequest(false);
        }
    };

    useEffect(() => {
        loadData(ano);
    }, []);

    const handleMonthClick = async (data: any) => {
        const [mesAbrev, ano] = data.period.split('/');
        const monthMap: { [key: string]: string } = {
            Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
            May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
            Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December'
        };
        const monthMapPt: { [key: string]: string } = {
            Jan: 'Janeiro', Feb: 'Fevereiro', Mar: 'Março', Apr: 'Abril',
            May: 'Maio', Jun: 'Junho', Jul: 'Julho', Aug: 'Agosto',
            Sep: 'Setembro', Oct: 'Outubro', Nov: 'Novembro', Dec: 'Dezembro'
        };
        const mesFull = monthMap[mesAbrev];
        const mesPt = monthMapPt[mesAbrev];
        setSelectedPeriod(`${mesPt} de ${ano}`);
        setLoadingDetails(true);
        try {
            const response = await getUserScByMonth(user, ano, mesFull);
            setMonthDetails(response);
        } catch (err) {
            setMonthDetails([]);
        } finally {
            setLoadingDetails(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const period = payload[0].payload.period;
            const [mesAbrev, ano] = period.split("/");
            const monthMap: Record<string, string> = {
                Jan: "Janeiro", Feb: "Fevereiro", Mar: "Março", Apr: "Abril",
                May: "Maio", Jun: "Junho", Jul: "Julho", Aug: "Agosto",
                Sep: "Setembro", Oct: "Outubro", Nov: "Novembro", Dec: "Dezembro"
            };
            const mesFull = monthMap[mesAbrev];

            return (
                <div style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    padding: "10px 14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                }}>
                    <p style={{ margin: 0, color: "#090f29ff", fontWeight: 450 }}>
                        {mesFull} de {ano}
                    </p>
                    <p style={{ margin: 0, color: "#4664e9ff" }}>
                        {payload[0].value} solicitações
                    </p>
                </div>
            );
        }
        return null;
    };

    const columns: Column[] = [
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
            key: 'CODFILIAL',
            header: 'Filial',
            sortable: true,
            width: '100px'
        },
        {
            key: 'CODTMV',
            header: 'Tipo Mov',
            sortable: true,
            width: '120px'
        },
        {
            key: 'DATAEMISSAO',
            header: 'Data',
            sortable: true,
            width: '130px',
            render: (value: string) => (
                <span>{new Date(value).toLocaleDateString('pt-BR')}</span>
            )
        },
        {
            key: 'NUMEROMOV',
            header: 'IdMov',
            sortable: true,
            width: '100px',
            render: (value: string) => (
                <code className="bg-light px-2 py-1 rounded">{value}</code>
            )
        },
        {
            key: 'QTD_ITENS',
            header: 'Qtd Itens',
            sortable: true,
            width: '100px',
            render: (value: string, row: any) => (
                <Badge bg="primary">
                    {row.QTD_ITENS ?? row.QTD ?? row.TOTALITENS ?? '0'}
                </Badge>
            )
        },
        {
            key: 'VALORBRUTO',
            header: 'Valor',
            sortable: true,
            width: '140px',
            render: (value: string) => (
                <span>
                    R$ {Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Ações',
            sortable: false,
            width: '80px',
            render: (_value: string, row: any) => (
                <div className="d-flex justify-content-center">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleRowClick(row)}
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
            <div className="d-flex gap-2 mb-3">
                <input
                    type="number"
                    className="form-control"
                    style={{ maxWidth: 80 }}
                    value={ano}
                    onChange={(e) => {
                        if (e.target.value.length <= 4) {
                            setAno(Number(e.target.value));
                        }
                    }}
                    placeholder="Ano"
                />
                <Button className="btn btn-modern" onClick={() => loadData(ano)}>Pesquisar</Button>
            </div>

            <div className="user-grafics">
                <Card className="p-3 shadow-sm">
                    <h5 className="mb-3">Solicitações por Mês</h5>
                    {chartData.length === 0 ? (
                        <div className="text-center py-5" style={{ minHeight: 300 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                            <h5 className="text-muted mb-2">Nenhuma solicitação encontrada</h5>
                            <p className="text-muted">
                                Você ainda não possui solicitações de compra registradas no sistema.
                                <br />
                                Quando realizar suas primeiras solicitações, elas aparecerão aqui!
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                                <Bar
                                    dataKey="quantidade"
                                    fill="#0088FE"
                                    radius={[4, 4, 0, 0]}
                                    onClick={(data) => handleMonthClick(data)}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>

                <Card className="mt-4 shadow-sm">
                    {loadingDetails ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 100 }}>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : monthDetails.length === 0 ? (
                        <p className="text-muted">
                            {chartData.length === 0
                                ? "Você não possui solicitações registradas."
                                : "Selecione um período no gráfico acima para visualizar os detalhes das suas solicitações."}
                        </p>
                    ) : (
                        <div className="month-details-wrapper">
                            <style>{` .month-details-wrapper th { text-transform: none !important; } `}</style>
                            <DataTable
                                data={monthDetails}
                                columns={columns}
                                loading={loadingDetails}
                                itemsPerPage={10}
                                searchable={true}
                                className="shadow-none"
                            />
                        </div>
                    )}
                </Card>

                <Modal
                    show={showRequestModal}
                    onHide={() => setShowRequestModal(false)}
                    size="lg"
                    centered
                    className="product-modal"
                >
                    <Modal.Header closeButton className="ps-2">
                        <Modal.Title>Detalhes da Solicitação {selectedMov?.IDMOV}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {loadingRequest ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 120 }}>
                                <Spinner animation="border" />
                            </div>
                        ) : requestItems.length === 0 ? (
                            <div className="text-center text-muted py-3">
                                Nenhum item encontrado para esta solicitação.
                            </div>
                        ) : (
                            <>
                                {[
                                    {
                                        label: "Serviços",
                                        key: "SERVICO",
                                        filter: (i: any) => !i.GRPFATURAMENTO,
                                        responsibility: "Responsabilidade da equipe de Compras"
                                    },
                                    {
                                        label: "Estocáveis",
                                        key: "ESTOCAVEL",
                                        filter: (i: any) => i.GRPFATURAMENTO === "ESTOCAVEL",
                                        responsibility: "Responsabilidade da equipe de Almoxarifado"
                                    },
                                    {
                                        label: "Não Estocáveis",
                                        key: "NAOESTOQUE",
                                        filter: (i: any) => i.GRPFATURAMENTO === "NAOESTOQUE",
                                        responsibility: "Responsabilidade da equipe de Compras"
                                    },
                                ].map(({ label, key, filter, responsibility }) => {
                                    const groupItems = requestItems.filter(filter);
                                    if (groupItems.length === 0) return null;

                                    return (
                                        <div key={key} className="mb-4">
                                            <h5 className="fw-bold text-primary mb-1 p-2">
                                                {label} ({groupItems.length})
                                            </h5>
                                            <p className="text-muted mb-2 px-2" style={{ fontSize: '0.9rem' }}>
                                                {responsibility}
                                            </p>
                                            <div className="table-responsive px-2">
                                                <table className="table table-striped table-hover align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="title-row"><div className="span title-row"> Produto</div></th>
                                                            <th className="title-row"><div className="span title-row"> Quantidade</div></th>
                                                            <th className="title-row"><div className="span title-row"> Valor Unitário</div></th>
                                                            <th className="title-row"><div className="span title-row"> Valor Total</div></th>
                                                            <th className="title-row"><div className="span title-row"> Status</div></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {groupItems.map((item: any, index: number) => (
                                                            <tr key={index}>
                                                                <td>{item.CODIGOPRD}</td>
                                                                <td>{item.QUANTIDADE}</td>
                                                                <td>
                                                                    {Number(item.PRECOUNITARIO).toLocaleString("pt-BR", {
                                                                        style: "currency",
                                                                        currency: "BRL",
                                                                    })}
                                                                </td>
                                                                <td>
                                                                    {(Number(item.PRECOUNITARIO) * Number(item.QUANTIDADE)).toLocaleString("pt-BR", {
                                                                        style: "currency",
                                                                        currency: "BRL",
                                                                    })}
                                                                </td>
                                                                <td>
                                                                    <Badge className="primaryUser">
                                                                        {item.STATUS_ITEM}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
                            Fechar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
}