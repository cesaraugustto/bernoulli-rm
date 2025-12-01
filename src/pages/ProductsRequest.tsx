import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Card, Form, Alert, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";
import { setPageTitle } from "../redux/slices/pageTitleSlice";
import { setPageSubtitle } from '../redux/slices/pageSubtitleSlice';
import { ArrowLeft, Package, Plus, Minus, Save, Send, Trash, ChevronDown, ChevronUp, HelpCircle, AlertTriangle } from 'lucide-react';
import '../styles/productRequest.scss';
import { getProductsColigada, getProductsFilial, getProductsCC, getProductsNC, getProductsNF, getProductsClassificacao, getProductsTipo, getProductsJustificativa, getProductsNOF, createProductMovement } from '../services/productsService'; //Criei aqui o método pra buscar as coligadas
import type { RootState } from '../redux/store';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import Select from 'react-select';
import ResponseModal from '../components/ResponseModal';


registerLocale('pt-BR', ptBR);

const FieldWithTooltip = ({ label, tooltip, children }: { label: string; tooltip: string; children: React.ReactNode }) => (
  <Form.Group>
    <Form.Label className="d-flex align-items-center gap-1">
      {label}
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip className="custom-tooltip">{tooltip}</Tooltip>}
      >
        <HelpCircle size={14} className="text-muted" style={{ cursor: 'help' }} />
      </OverlayTrigger>
    </Form.Label>
    {children}
  </Form.Group>
);

interface ProductRequestItem {
  codigoPrd: string;
  nome: string;
  idPrd: string;
  quantidade: number;
  preco: number;
  nof: string;
  expanded: boolean;
}

interface SelectedProduct {
  codigoPrd: string;
  idPrd: string;
  nome: string;
}

interface HeaderFilters {
  coligada: string;
  filial: string;
  checkOrcamentario: string;
  dataEmissao: string;
  centroCusto: string;
  naturezaContabil: string;
  naturezaFinanceira: string;
  classificacao: string;
  tipo: string;
  justificativa: string;
  historico: string;
}

interface Coligada {
  CODCOLIGADA: string;
  NOME: string;
}

interface Filial {
  CODFILIAL: string;
  NOME: string;
}

export default function ProductRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedProducts: SelectedProduct[] = location.state?.selectedProducts || [];

  const [requestItems, setRequestItems] = useState<ProductRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [filters, setFilters] = useState<HeaderFilters>({
    coligada: '',
    filial: '',
    checkOrcamentario: '',
    dataEmissao: '',
    centroCusto: '',
    naturezaContabil: '',
    naturezaFinanceira: '',
    classificacao: '',
    tipo: '',
    justificativa: '',
    historico: ''
  });

  const [coligadas, setColigadas] = useState<Array<{ value: string; label: string }>>([]);
  const [filiais, setFiliais] = useState<Array<{ value: string; label: string }>>([]);
  const [centrosCusto, setCentrosCusto] = useState<Array<{ value: string; label: string }>>([]);
  const [naturezasContabil, setNaturezasContabil] = useState<Array<{ value: string; label: string }>>([]);
  const [naturezasFinanceira, setNaturezasFinanceira] = useState<Array<{ value: string; label: string }>>([]);
  const [classificacoes, setClassificacoes] = useState<Array<{ value: string; label: string }>>([]);
  const [tipos, setTipos] = useState<Array<{ value: string; label: string }>>([]);
  const [justificativas, setJustificativas] = useState<Array<{ value: string; label: string }>>([]);
  const [nofsPorProduto, setNofsPorProduto] = useState<Record<string, Array<{ value: string; label: string }>>>({});
  const [checkOrcamentarioDate, setCheckOrcamentarioDate] = useState<Date>(new Date());
  const [dataEntregaDate, setDataEntregaDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const user = useSelector((state: RootState) => state.auth.user);
  const [rateioItems, setRateioItems] = useState<Array<{ centroCusto: string; percentual: number }>>([]);
  const [showModalRateio, setShowModalRateio] = useState(false);
  const [showModalCamposObrigatorios, setShowModalCamposObrigatorios] = useState(false);
  const [camposObrigatoriosVazios, setCamposObrigatoriosVazios] = useState<string[]>([]);

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [apiResponse, setApiResponse] = useState<{
    success: boolean;
    message: string;
    details?: any;
  }>({ success: false, message: '', details: null });

  useEffect(() => {
    dispatch(setPageTitle("Requisições 📝"));
    dispatch(setPageSubtitle("Prossiga com a requisição"));
  }, [dispatch]);

  useEffect(() => {
    if (selectedProducts.length === 0) {
      navigate('/products');
      return;
    }

    const initialItems: ProductRequestItem[] = selectedProducts.map(product => ({
      codigoPrd: product.codigoPrd,
      idPrd: product.idPrd,
      nome: product.nome,
      quantidade: 1,
      preco: 0,
      nof: '',
      expanded: false
    }));

    setRequestItems(initialItems);
  }, [selectedProducts, navigate]);


  useEffect(() => {
    const fetchColigadas = async () => {
      try {
        setLoading(true);
        const response = await getProductsColigada(user[0].CODUSUARIO);
        const coligadasFormatadas = response.map((col: Coligada) => ({
          value: col.CODCOLIGADA,
          label: col.NOME
        }));
        setColigadas(coligadasFormatadas);
      } catch (err) {
        setError('Erro ao carregar coligadas');
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchColigadas();
  }, []);

  useEffect(() => {
    const fetchFiliais = async () => {
      if (filters.coligada) {
        try {
          setLoading(true);
          const response = await getProductsFilial(filters.coligada);
          const filiaisFormatadas = response.map((fil: Filial) => ({
            value: fil.CODFILIAL,
            label: fil.NOME
          }));
          setFiliais(filiaisFormatadas);
        } catch (err) {
          setError('Erro ao carregar filiais');
          setTimeout(() => setError(null), 3000);
        } finally {
          setLoading(false);
        }
      } else {
        setFiliais([]);
        setFilters(prev => ({
          ...prev,
          filial: '',
          centroCusto: ''
        }));
      }
    };

    fetchFiliais();
  }, [filters.coligada]);

  useEffect(() => {
    const fetchCentrosCusto = async () => {
      if (filters.filial) {
        try {
          setLoading(true);
          const response = await getProductsCC(filters.coligada, user?.[0]?.CODUSUARIO);
          const centrosCustoFormatados = response.map((cc: any) => ({
            value: cc.CODCCUSTO,
            label: cc.NOME
          }));

          setCentrosCusto(centrosCustoFormatados);
        } catch (err) {
          setError('Erro ao carregar centros de custo');
          setTimeout(() => setError(null), 3000);
        } finally {
          setLoading(false);
        }
      } else {
        setCentrosCusto([]);
        setFilters(prev => ({
          ...prev,
          centroCusto: ''
        }));
      }
    };
    fetchCentrosCusto();
  }, [filters.filial]);

  useEffect(() => {
    const fetchNaturezaContabil = async () => {
      if (filters.coligada) {
        try {
          setLoading(true);
          const response = await getProductsNC(filters.coligada);
          const naturezaContabilFormatados = response.map((nc: any) => ({
            value: nc.CODTB1FLX,
            label: nc.DESCRICAO
          }));
          setNaturezasContabil(naturezaContabilFormatados);
        } catch (err) {
          setError('Erro ao carregar natureza contábil');
          setTimeout(() => setError(null), 3000);
        } finally {
          setLoading(false);
        }
      } else {
        setNaturezasContabil([]);
        setFilters(prev => ({
          ...prev,
          naturezaContabil: ''
        }));
      }
    };
    fetchNaturezaContabil();
  }, [filters.coligada]);

  useEffect(() => {
    const fetchNaturezaFinanceira = async () => {
      if (filters.coligada) {
        try {
          setLoading(true);
          const response = await getProductsNF(filters.coligada);
          const naturezaFinanceiraFormatados = response.map((nf: any) => ({
            value: nf.CODTB4FLX,
            label: nf.DESCRICAO
          }));

          setNaturezasFinanceira(naturezaFinanceiraFormatados);
        } catch (err) {
          setError('Erro ao carregar Natureza Financeira');
          setTimeout(() => setError(null), 3000);
        } finally {
          setLoading(false);
        }
      } else {
        setNaturezasFinanceira([]);
        setFilters(prev => ({
          ...prev,
          naturezaFinanceira: ''
        }));
      }
    };

    fetchNaturezaFinanceira();
  }, [filters.coligada]);

  useEffect(() => {
    const fetchClassificacao = async () => {
      if (filters.coligada) {
        try {
          setLoading(true);
          const response = await getProductsClassificacao(filters.coligada);
          const classificacaoFormatados = response.map((cl: any) => ({
            value: cl.CODTB2FAT,
            label: cl.DESCRICAO
          }));

          setClassificacoes(classificacaoFormatados);
        } catch (err) {
          setError('Erro ao carregar classificacoes');
          setTimeout(() => setError(null), 3000);
        } finally {
          setLoading(false);
        }
      } else {
        setClassificacoes([]);
        setFilters(prev => ({
          ...prev,
          classificacao: ''
        }));
      }
    };

    fetchClassificacao();
  }, [filters.coligada]);

  useEffect(() => {
    const fetchTipos = async () => {
      if (filters.coligada) {
        try {
          setLoading(true);
          const response = await getProductsTipo(filters.coligada);
          const tiposFormatados = response.map((tp: any) => ({
            value: tp.CODTB3FAT,
            label: tp.DESCRICAO
          }));

          setTipos(tiposFormatados);
        } catch (err) {
          setError('Erro ao carregar tipos');
          setTimeout(() => setError(null), 3000);
        } finally {
          setLoading(false);
        }
      } else {
        setTipos([]);
        setFilters(prev => ({
          ...prev,
          tipo: ''
        }));
      }
    };

    fetchTipos();
  }, [filters.coligada]);

  useEffect(() => {
    const fetchJustificativas = async () => {
      if (filters.coligada) {
        try {
          setLoading(true);
          const response = await getProductsJustificativa(filters.coligada);

          const justificativasFormatados = response.map((jf: any) => ({
            value: jf.CODTB4FAT,
            label: jf.DESCRICAO
          }));

          setJustificativas(justificativasFormatados);
        } catch (err) {
          setError('Erro ao carregar justificativas');
          setTimeout(() => setError(null), 3000);
        } finally {
          setLoading(false);
        }
      } else {
        setJustificativas([]);
        setFilters(prev => ({
          ...prev,
          justificativa: ''
        }));
      }
    };
    fetchJustificativas();
  }, [filters.coligada]);

  useEffect(() => {
    const fetchAllNOFs = async () => {
      if (filters.coligada && requestItems.length > 0) {
        try {
          setLoading(true);
          const nofsTemp: Record<string, Array<{ value: string; label: string }>> = {};
          const itemsTemp = [...requestItems];

          for (let i = 0; i < itemsTemp.length; i++) {
            const item = itemsTemp[i];
            try {
              const response = await getProductsNOF(filters.coligada, item.codigoPrd);

              const nofsFormatados = response.map((nof: any) => ({
                value: nof.CODTBORCAMENTO,
                label: nof.DESCRICAO
              }));
              const idPrdFromResp =
                response?.[0]?.IDPRD ??
                response?.[0]?.idPrd ??
                '';

              itemsTemp[i] = {
                ...item,
                idPrd: idPrdFromResp ? String(idPrdFromResp) : item.idPrd || ''
              };

              nofsTemp[item.codigoPrd] = nofsFormatados;
            } catch (err) {
              nofsTemp[item.codigoPrd] = [];
            }
          }

          setRequestItems(itemsTemp);
          setNofsPorProduto(nofsTemp);
        } catch (err) {
          setError('Erro ao carregar NOFs dos produtos');
          setTimeout(() => setError(null), 3000);
        } finally {
          setLoading(false);
        }
      } else {
        setNofsPorProduto({});
      }
    };

    fetchAllNOFs();
  }, [filters.coligada, requestItems.length]);

  const handleFilterChange = (field: keyof HeaderFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleExpanded = (index: number) => {
    setRequestItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setRequestItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, quantidade: newQuantity } : item
      )
    );
  };

  const updatePrice = (index: number, newPrice: number) => {
    setRequestItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, preco: newPrice } : item
      )
    );
  };

  const updateNOF = (index: number, newNOF: string) => {
    setRequestItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, nof: newNOF } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setRequestItems(prev => prev.filter((_, i) => i !== index));
  };

  const addRateio = () => {
    setRateioItems(prev => {
      if (prev.length === 0) {
        return [{ centroCusto: filters.centroCusto || '', percentual: 100 }];
      }
      return [...prev, { centroCusto: '', percentual: 0 }];
    });
  };

  const removeRateio = (index: number) => {
    setRateioItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateRateio = (index: number, field: 'centroCusto' | 'percentual', value: string | number) => {
    setRateioItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const calcularValorRateio = (percentual: number) => {
    const totalGeral = requestItems.reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
    return (totalGeral * percentual) / 100;
  };

  useEffect(() => {
    if (filters.centroCusto && rateioItems.length === 0) {
      setRateioItems([{
        centroCusto: filters.centroCusto,
        percentual: 100
      }]);
    }
  }, [filters.centroCusto]);

  useEffect(() => {
    if (filters.classificacao) {
      const classificacaoSelecionada = classificacoes.find(c => c.value === filters.classificacao)?.label || '';
      const hoje = new Date();
      if (classificacaoSelecionada === 'PLANEJADA') {
        hoje.setDate(hoje.getDate() + 10);
        setDataEntregaDate(hoje);
      } else if (classificacaoSelecionada === 'EMERGENCIAL') {
        hoje.setDate(hoje.getDate() + 1);
        setDataEntregaDate(hoje);
      }
    }
  }, [filters.classificacao, classificacoes]);

  const handleSubmitRequest = async () => {
    if (requestItems.length === 0) {
      setError('Adicione pelo menos um produto à requisição');
      return;
    }

    if (rateioItems.length > 0) {
      const totalPercentual = rateioItems.reduce((sum, r) => sum + r.percentual, 0);
      if (totalPercentual > 100) {
        setShowModalRateio(true);
        return;
      }
      if (Math.abs(totalPercentual - 100) > 0.01) {
        setError(`O rateio deve somar 100%. Atual: ${totalPercentual.toFixed(2)}%`);
        return;
      }

      const hasRateioSemCC = rateioItems.some(r => !r.centroCusto);
      if (hasRateioSemCC) {
        setError('Selecione o centro de custo para todos os rateios');
        return;
      }
    }

    const hasInvalidQuantity = requestItems.some(item => item.quantidade < 1);
    if (hasInvalidQuantity) {
      setError('Todas as quantidades devem ser maior que zero');
      return;
    }

    const tipoSelecionado = tipos.find(t => t.value === filters.tipo)?.label || '';
    const justificativaObrigatoria = tipoSelecionado !== 'PADRÃO';
    const camposParaValidar = [
      { campo: 'coligada', nome: 'Coligada' },
      { campo: 'filial', nome: 'Filial' },
      { campo: 'centroCusto', nome: 'Centro de Custo' },
      { campo: 'classificacao', nome: 'Classificação' },
      { campo: 'tipo', nome: 'Tipo' },
      { campo: 'naturezaContabil', nome: 'Natureza Contábil' },
      { campo: 'naturezaFinanceira', nome: 'Natureza Financeira' }
    ];
    if (justificativaObrigatoria) {
      camposParaValidar.push({ campo: 'justificativa', nome: 'Justificativa' });
    }

    const camposVazios = camposParaValidar
      .filter(({ campo }) => !filters[campo as keyof HeaderFilters])
      .map(({ nome }) => nome);

    if (camposVazios.length > 0) {
      setCamposObrigatoriosVazios(camposVazios);
      setShowModalCamposObrigatorios(true);
      return;
    }

    setLoading(true);
    try {
      const movementItems = requestItems.map((item, index) => {
        const itemBase = {
          sequentialId: index + 1,
          productId: parseInt(item.idPrd),
          quantity: item.quantidade,
          unitPrice: item.preco,
          budgetGroupCode: filters.coligada,
          costCenterCode: filters.centroCusto,
          bugdetNatureCompanyId: filters.coligada,
          bugdetNatureCode: item.nof
        };

        if (rateioItems.length > 0) {
          const itemTotal = item.quantidade * item.preco;

          return {
            ...itemBase,
            costCenterApportionments: rateioItems.map((rateio) => ({
              companyId: parseInt(filters.coligada),
              apportionmentId: -1,
              movementId: -1,
              movementItemSequentialId: index + 1,
              costCenterCode: rateio.centroCusto,
              value: (itemTotal * rateio.percentual) / 100,
              costCenterName: centrosCusto.find(cc => cc.value === rateio.centroCusto)?.label || ''
            }))
          };
        }

        return itemBase;
      });

      const today = new Date();

      const offset = -3;
      today.setHours(today.getHours() + offset);

      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const registerDate = `${yyyy}-${mm}-${dd}T00:00:00-03:00`;
      const deliveryDate = `${dataEntregaDate.getFullYear()}-${String(dataEntregaDate.getMonth() + 1).padStart(2, '0')}-${String(dataEntregaDate.getDate()).padStart(2, '0')}T00:00:00-03:00`;

      const payload = {
        companyId: parseInt(filters.coligada),
        movementId: -1,
        branchId: parseInt(filters.filial),
        warehouseCode: "001",
        movementTypeCode: "1.1.03",
        registerDate: `${registerDate}`,
        deliveryDate: deliveryDate,
        extraDate1: `${registerDate}`,
        longHistory: filters.historico,
        financialOptionalTable1Code: filters.naturezaContabil || "",
        financialOptionalTable4Code: filters.naturezaFinanceira || "",
        costCenterCode: filters.centroCusto,
        movementItems: movementItems
      };
      const response = await createProductMovement(payload);

      setApiResponse({
        success: true,
        message: 'Requisição enviada com sucesso!',
        details: response
      });
      setShowResponseModal(true);
    } catch (err: any) {

      let errorMessage = 'Erro ao enviar requisição';
      let errorDetails = null;

      if (err.response?.data) {
        const apiError = err.response.data;
        errorMessage = apiError.message || apiError.detailedMessage || errorMessage;
        errorDetails = apiError;
      } else if (err.message) {
        errorMessage = err.message;
        errorDetails = err;
      }

      setApiResponse({
        success: false,
        message: errorMessage,
        details: errorDetails
      });
      setShowResponseModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    if (apiResponse.success) {
      navigate('/products');
    }
  };

  const totalItems = requestItems.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <div className="product-request-container">
      <Row className="m-0">
        <Col>
          <div className="page-header">
            <div className="header-top">
              <div className="total-geral-display">
                <div className="total-icon">💰</div>
                <div className="total-info">
                  <span className="total-label">Valor Total da Requisição</span>
                  <span className="total-value">
                    R$ {requestItems.reduce((sum, item) => sum + (item.quantidade * item.preco), 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="header-stats">
                <div className="stat-card">
                  <Package size={20} />
                  <div>
                    <span className="stat-value">{requestItems.length}</span>
                    <span className="stat-label">Produtos</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div>
                    <span className="stat-value">{totalItems}</span>
                    <span className="stat-label">Total Itens</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="header-filters">
              <Row className="mt-0">
                <Col md={6}>
                  <label className="form-label">Coligada *</label>
                  <Select
                    value={
                      filters.coligada
                        ? { value: filters.coligada, label: coligadas.find(col => col.value === filters.coligada)?.label }
                        : null
                    }
                    onChange={(selected) => handleFilterChange('coligada', selected ? selected.value : '')}
                    isClearable
                    placeholder="Selecione..."
                    noOptionsMessage={() => "Nenhuma opção encontrada"}
                    options={coligadas.map(col => ({ value: col.value, label: col.label }))}
                    className="select-natureza"
                    classNamePrefix="select-natureza"
                  />

                </Col>

                <Col md={6}>
                  <label className="form-label">Filial *</label>
                  <Select
                    value={
                      filters.filial
                        ? { value: filters.filial, label: filiais.find(fil => fil.value === filters.filial)?.label }
                        : null
                    }
                    onChange={(selected) => handleFilterChange('filial', selected ? selected.value : '')}
                    isDisabled={!filters.coligada}
                    isClearable
                    placeholder="Selecione..."
                    noOptionsMessage={() => "Nenhuma opção encontrada"}
                    options={filiais.map(fil => ({ value: fil.value, label: fil.label }))}
                    className="select-natureza"
                    classNamePrefix="select-natureza"
                  />
                </Col>
              </Row>

              <Row className="mt-2">

                <Col md={4}>
                  <label className="form-label">Classificação *</label>
                  <Select
                    value={
                      filters.classificacao
                        ? { value: filters.classificacao, label: classificacoes.find(cl => cl.value === filters.classificacao)?.label }
                        : null
                    }
                    onChange={(selected) => handleFilterChange('classificacao', selected ? selected.value : '')}
                    isDisabled={!filters.filial}
                    isClearable
                    placeholder="Selecione..."
                    noOptionsMessage={() => "Nenhuma opção encontrada"}
                    options={classificacoes.map(cl => ({ value: cl.value, label: cl.label }))}
                    className="select-natureza"
                    classNamePrefix="select-natureza"
                  />
                </Col>

                <Col md={4}>
                  <label className="form-label">Tipo *</label>
                  <Select
                    value={
                      filters.tipo
                        ? { value: filters.tipo, label: tipos.find(tp => tp.value === filters.tipo)?.label }
                        : null
                    }
                    onChange={(selected) => handleFilterChange('tipo', selected ? selected.value : '')}
                    isDisabled={!filters.filial}
                    isClearable
                    placeholder="Selecione..."
                    noOptionsMessage={() => "Nenhuma opção encontrada"}
                    options={tipos.map(tp => ({ value: tp.value, label: tp.label }))}
                    className="select-natureza"
                    classNamePrefix="select-natureza"
                  />
                </Col>

                <Col md={4}>
                  <FieldWithTooltip
                    label={`Justificativa${tipos.find(t => t.value === filters.tipo)?.label !== 'PADRÃO' ? ' *' : ''}`}
                    tooltip="Selecione a justificativa responsável pela requisição"
                  >
                    <Select
                      value={
                        filters.justificativa
                          ? { value: filters.justificativa, label: justificativas.find(jf => jf.value === filters.justificativa)?.label }
                          : null
                      }
                      onChange={(selected) =>
                        handleFilterChange('justificativa', selected ? selected.value : '')
                      }
                      isDisabled={!filters.filial}
                      isClearable
                      placeholder="Selecione..."
                      noOptionsMessage={() => "Nenhuma opção encontrada"}
                      options={justificativas.map(jf => ({ value: jf.value, label: jf.label }))}
                      className="select-natureza"
                      classNamePrefix="select-natureza"
                    />
                  </FieldWithTooltip>
                </Col>
              </Row>

              <Row className="mt-2">
                <Col md={4}>
                  <FieldWithTooltip
                    label="Check Orçamentário *"
                    tooltip="Selecione a Filial responsável pela requisição"
                  >
                    <DatePicker
                      selected={checkOrcamentarioDate}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setCheckOrcamentarioDate(date);
                          const formatted = date.toISOString().split('T')[0];
                          handleFilterChange('checkOrcamentario', formatted);
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      locale="pt-BR"
                      className="form-control"
                      placeholderText="Selecione a data"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      disabled={!filters.filial}
                      wrapperClassName="w-100"
                    />
                  </FieldWithTooltip>
                </Col>

                <Col md={4}>
                  <label className="form-label">Centro de Custo *</label>
                  <Select
                    value={
                      filters.centroCusto
                        ? { value: filters.centroCusto, label: centrosCusto.find(cc => cc.value === filters.centroCusto)?.label }
                        : null
                    }
                    onChange={(selected) => handleFilterChange('centroCusto', selected ? selected.value : '')}
                    isDisabled={!filters.filial}
                    isClearable
                    placeholder="Selecione..."
                    noOptionsMessage={() => "Nenhuma opção encontrada"}
                    options={centrosCusto.map(cc => ({ value: cc.value, label: cc.label }))}
                    className="select-natureza"
                    classNamePrefix="select-natureza"
                  />
                </Col>

                <Col md={4}>
                  <label className="form-label">Entrega prevista *</label>
                  <DatePicker
                    selected={dataEntregaDate}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setDataEntregaDate(date);
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale="pt-BR"
                    className="form-control"
                    placeholderText="Selecione a data"
                    minDate={(() => {
                      const classificacaoSelecionada = classificacoes.find(c => c.value === filters.classificacao)?.label || '';
                      const minDate = new Date();

                      if (classificacaoSelecionada === 'PLANEJADA') {
                        minDate.setDate(minDate.getDate() + 10);
                      } else if (classificacaoSelecionada === 'EMERGENCIAL') {
                        minDate.setDate(minDate.getDate() + 1);
                      } else {
                        minDate.setDate(minDate.getDate() + 7);
                      }

                      return minDate;
                    })()}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    disabled={!filters.filial}
                    wrapperClassName="w-100"
                  />
                </Col>
              </Row>

              <Row className="mt-2">
                <Col md={6}>
                  <FieldWithTooltip
                    label="Natureza Contábil *"
                    tooltip="Selecione a natureza contábil responsável pela requisição"
                  >
                    <Select
                      value={naturezasContabil.find(nc => nc.value === filters.naturezaContabil) || null}
                      onChange={(selectedOption) => {
                        handleFilterChange('naturezaContabil', selectedOption?.value || '');
                      }}
                      options={naturezasContabil}
                      isDisabled={!filters.filial}
                      isClearable
                      placeholder="Selecione ou busque..."
                      noOptionsMessage={() => "Nenhuma opção encontrada"}
                      className="select-natureza"
                      classNamePrefix="select-natureza"
                    />
                  </FieldWithTooltip>
                </Col>

                <Col md={6}>
                  <FieldWithTooltip
                    label="Natureza Financeira *"
                    tooltip="Selecione a natureza financeira responsável pela requisição"
                  >
                    <Select
                      value={naturezasFinanceira.find(nf => nf.value === filters.naturezaFinanceira) || null}
                      onChange={(selectedOption) => {
                        handleFilterChange('naturezaFinanceira', selectedOption?.value || '');
                      }}
                      options={naturezasFinanceira}
                      isDisabled={!filters.filial}
                      isClearable
                      placeholder="Selecione ou busque..."
                      noOptionsMessage={() => "Nenhuma opção encontrada"}
                      className="select-natureza"
                      classNamePrefix="select-natureza"
                    />
                  </FieldWithTooltip>
                </Col>
              </Row>

              <Row className="mt-2">
                <Col md={12}>
                  <span className="form-label">Histórico *</span>
                  <Form.Control
                    type="text"
                    value={filters.historico}
                    onChange={(e) => handleFilterChange('historico', e.target.value)}
                    placeholder="Digite o histórico..."
                    disabled={!filters.filial}
                  />
                </Col>
              </Row>

            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-3">
              {success}
            </Alert>
          )}

          <div className="request-items">
            {requestItems.map((item, index) => (
              <Card key={item.codigoPrd} className="request-item-card">
                <Card.Body>
                  <div className="item-header-compact" onClick={() => toggleExpanded(index)}>
                    <div className="product-compact-info">
                      <div className="product-code-badge">
                        <Package size={16} />
                        <code>{item.codigoPrd}</code>
                      </div>
                      <div className="product-name-compact">
                        <span className="fw-semibold">{item.nome}</span>
                      </div>
                    </div>
                    <div className="expand-controls">
                      <Button
                        variant="link"
                        className="expand-btn"
                      >
                        {item.expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </Button>
                    </div>
                  </div>

                  {item.expanded && (
                    <div className="item-expanded-content">
                      <Row className="mt-3">
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Código</Form.Label>
                            <Form.Control
                              type="text"
                              value={item.codigoPrd}
                              disabled
                              className="form-control-readonly"
                            />
                          </Form.Group>
                        </Col>

                        <Col md={9}>
                          <Form.Group>
                            <Form.Label>Nome do Produto</Form.Label>
                            <Form.Control
                              type="text"
                              value={item.nome}
                              disabled
                              className="form-control-readonly"
                            />
                          </Form.Group>
                        </Col>

                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Quantidade *</Form.Label>
                            <div className="quantity-input-group">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => updateQuantity(index, item.quantidade - 1)}
                                disabled={item.quantidade <= 1}
                              >
                                <Minus size={14} />
                              </Button>
                              <Form.Control
                                type="number"
                                value={item.quantidade}
                                onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                min="1"
                                className="quantity-input"
                              />
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => updateQuantity(index, item.quantidade + 1)}
                              >
                                <Plus size={14} />
                              </Button>
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Preço Unitário</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              min={0}
                              value={item.preco || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updatePrice(index, value < 0 ? 0 : value);
                              }}
                              placeholder="0,00"
                              className="form-control"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row className="mt-0 d-flex">
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>NOF</Form.Label>
                            <Select
                              value={
                                (() => {
                                  const opcoes = nofsPorProduto[item.codigoPrd] || [];
                                  if (opcoes.length === 1) {
                                    return { value: opcoes[0].value, label: opcoes[0].label };
                                  }
                                  return item.nof
                                    ? { value: item.nof, label: opcoes.find(nof => nof.value === item.nof)?.label }
                                    : null;
                                })()
                              }
                              onChange={(selected) => updateNOF(index, selected ? selected.value : '')}
                              isDisabled={!filters.coligada || !nofsPorProduto[item.codigoPrd]?.length}
                              isClearable
                              placeholder="Selecione..."
                              noOptionsMessage={() => "Nenhuma opção encontrada"}
                              options={nofsPorProduto[item.codigoPrd]?.map(nof => ({ value: nof.value, label: nof.label })) || []}
                              className="select-natureza"
                              classNamePrefix="select-natureza"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 })
                              }}
                            />

                          </Form.Group>
                          <input type="hidden" name={`idPrd_${item.codigoPrd}`} value={item.idPrd} />
                        </Col>

                        <Col md={9} className="d-flex justify-content-end">
                          <Form.Group>
                            <Form.Label>&nbsp;</Form.Label>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="remove-btn w-100"
                            >
                              <Trash size={14} className="me-1" />
                              Remover
                            </Button>
                          </Form.Group>
                        </Col>
                      </Row>

                      {item.preco > 0 && (
                        <div className="total-display">
                          <strong>Total: </strong>
                          <span className="total-value">
                            R$ {(item.quantidade * item.preco).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>

          {requestItems.length > 0 && (
            <Card className="rateio-card mt-4">
              <Card.Body>
                <div className="rateio-header">
                  <h5 className="mb-0">Rateio por Centro de Custo</h5>
                  <div className="rateio-restante">
                    <span className="label">Percentual restante:</span>
                    <span className={`value ${(() => {
                      const totalPercentual = rateioItems.reduce((sum, r) => sum + r.percentual, 0);
                      return totalPercentual === 100 ? 'text-success' : totalPercentual > 100 ? 'text-danger' : 'text-warning';
                    })()}`}>
                      {(() => {
                        const totalPercentual = rateioItems.reduce((sum, r) => sum + r.percentual, 0);
                        return (100 - totalPercentual).toFixed(2);
                      })()}%
                    </span>
                  </div>
                </div>

                <div className="rateio-content mt-3">
                  {rateioItems.map((rateio, index) => (
                    <Row key={index} className="mb-2 align-items-end">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="">Centro de Custo</Form.Label>
                          <Select
                            value={
                              rateio.centroCusto
                                ? { value: rateio.centroCusto, label: centrosCusto.find(cc => cc.value === rateio.centroCusto)?.label }
                                : null
                            }
                            onChange={(selected) => updateRateio(index, 'centroCusto', selected ? selected.value : '')}
                            isDisabled={!filters.coligada}
                            isClearable
                            placeholder="Selecione..."
                            noOptionsMessage={() => "Nenhuma opção encontrada"}
                            options={centrosCusto.map(cc => ({ value: cc.value, label: cc.label }))}
                            className="select-natureza"
                            classNamePrefix="select-natureza"
                          />


                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Percentual (%)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min={0}
                            max={100}
                            value={rateio.percentual || ''}
                            onChange={(e) => {
                              let valor = parseFloat(e.target.value) || 0;
                              if (valor < 0) valor = 0;
                              if (valor > 100) valor = 100;
                              updateRateio(index, 'percentual', valor);
                            }}
                            placeholder="0.00"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Valor (R$)</Form.Label>
                          <Form.Control
                            type="text"
                            value={`R$ ${calcularValorRateio(rateio.percentual).toFixed(2).replace('.', ',')}`}
                            disabled
                            className="form-control-readonly"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeRateio(index)}
                          style={{ height: '38px' }}
                        >
                          <Trash size={14} className="me-1" />
                          Remover
                        </Button>
                      </Col>
                    </Row>
                  ))}

                  <Button
                    size="sm"
                    onClick={addRateio}
                    className="mt-2 btn-linha-rateio"
                  >
                    <Plus size={14} className="me-1" />
                    Adicionar Linha de Rateio
                  </Button>

                  {rateioItems.length > 0 && (
                    <div className="rateio-summary mt-3 p-3 bg-light rounded">
                      <Row>
                        <Col md={4}>
                          <strong>Total:</strong>
                        </Col>
                        <Col md={3}>
                          <strong>{rateioItems.reduce((sum, r) => sum + r.percentual, 0).toFixed(2)}%</strong>
                        </Col>
                        <Col md={3}>
                          <strong>R$ {requestItems.reduce((sum, item) => sum + (item.quantidade * item.preco), 0).toFixed(2).replace('.', ',')}</strong>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          <div className="action-buttons d-flex justify-content-end">
            <Button
              onClick={handleSubmitRequest}
              disabled={loading || requestItems.length === 0}
              className="action-btn"
            >
              <Send size={16} className="me-1" />
              {loading ? 'Enviando...' : 'Enviar Requisição'}
            </Button>
          </div>

          {requestItems.length === 0 && (
            <div className="empty-state">
              <Package size={48} className="text-muted mb-3" />
              <h5 className="text-muted">Nenhum produto selecionado</h5>
              <p className="text-muted mb-3">
                Volte à página de produtos e selecione os itens desejados.
              </p>
              <Button variant="primary" onClick={() => navigate('/products')}>
                Selecionar Produtos
              </Button>
            </div>
          )}

          <Modal show={showModalRateio} onHide={() => setShowModalRateio(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>⚠️ Rateio Inválido</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>O total do rateio está acima de 100%!</p>
              <p>
                <strong>Total atual: </strong>
                <span className="text-danger">
                  {rateioItems.reduce((sum, r) => sum + r.percentual, 0).toFixed(2)}%
                </span>
              </p>
              <p className="mb-0">Por favor, ajuste os percentuais para que somem exatamente 100%.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={() => setShowModalRateio(false)}>
                Entendido
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showModalCamposObrigatorios}
            onHide={() => setShowModalCamposObrigatorios(false)}
            centered
            size="lg"
          >
            <Modal.Header closeButton className="modal-campos text-white">
              <Modal.Title>
                <AlertTriangle size={24} className="me-2" />
                Campos Obrigatórios Não Preenchidos!
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="alert alert-warning mb-3">
                <strong>Atenção!</strong> Os seguintes campos obrigatórios não foram preenchidos:
              </div>
              <ul className="list-group">
                {camposObrigatoriosVazios.map((campo, index) => (
                  <li key={index} className="list-group-item d-flex align-items-center">
                    <AlertTriangle size={18} className="text-danger me-2" />
                    <strong>{campo}</strong>
                  </li>
                ))}
              </ul>
              <p className="mt-3 mb-0 text-muted">
                Por favor, preencha todos os campos marcados com asterisco (*) antes de enviar a requisição.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={() => setShowModalCamposObrigatorios(false)}>
                Entendi, vou preencher
              </Button>
            </Modal.Footer>
          </Modal>

          <ResponseModal
            show={showResponseModal}
            onHide={handleCloseResponseModal}
            success={apiResponse.success}
            message={apiResponse.message}
            details={apiResponse.details}
          />
        </Col>
      </Row>
    </div>
  );
}