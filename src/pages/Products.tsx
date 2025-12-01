import { useState, useEffect } from 'react';
import { Row, Col, Alert, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '../components/Table';
import { getAllProducts } from '../services/productsService';
import { getUserPermission } from '../services/userService'
import '../styles/dashboard.scss';
import { useDispatch, useSelector } from "react-redux";
import { setPageTitle } from "../redux/slices/pageTitleSlice";
import { setPageSubtitle } from '../redux/slices/pageSubtitleSlice';
import ProductModal from '../components/ProductsModal';
import { ShoppingCart, Package } from 'lucide-react';
import type { RootState } from '../redux/store';

interface Product {
  id?: string;
  name?: string;
  code?: string;
  price?: number;
  category?: string;
  stock?: number;
  status?: string;
  description?: string;
  CODIGOPRD?: string;
  DESCRICAO?: string;
  [key: string]: any;
}

interface SelectedProduct {
  codigoPrd: string;
  nome: string;
}

export default function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
    dispatch(setPageTitle("Produtos 📦"));
    dispatch(setPageSubtitle("Faça requisições e confira detalhes de cada produto"));
  }, [dispatch]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [canInclude, setCanInclude] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchPermission = async () => {
      if (!user?.[0]?.CODUSUARIO) return;
      const permission = await getUserPermission(user[0].CODUSUARIO);
      if (permission[0]?.INCLUIR === 1) setCanInclude(true);
    };

    fetchPermission();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setShowProductModal(true);
    }
  }, [selectedProduct]);

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct("");
  };

  const handleProductSelection = (codigoPrd: string, nome: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedProducts(prev => [...prev, { codigoPrd, nome }]);
    } else {
      setSelectedProducts(prev => prev.filter(product => product.codigoPrd !== codigoPrd));
    }
  };

  const handleProceedToRequest = () => {
    if (selectedProducts.length === 0) {
      alert('Selecione pelo menos um produto para continuar.');
      return;
    }
    navigate('/product-request', {
      state: { selectedProducts: selectedProducts }
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns: Column[] = [
    {
      key: 'select',
      header: '',
      sortable: false,
      width: '50px',
      render: (_value: string, row: Product) => (
        <div className="d-flex justify-content-center">
          <input
            type="checkbox"
            className="form-check-input product-checkbox"
            checked={selectedProducts.some(p => p.codigoPrd === row.CODIGOPRD)}
            onChange={(e) => handleProductSelection(
              row.CODIGOPRD || '',
              row.DESCRICAO || 'Produto sem nome',
              e.target.checked
            )}
          />
        </div>
      )
    },
    {
      key: 'CODIGOPRD',
      header: 'Código',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <code className="bg-light px-2 py-1 rounded product-code">{value || '-'}</code>
      )
    },
    {
      key: 'DESCRICAO',
      header: 'Descrição do Produto',
      sortable: true,
      render: (value: string, row: Product) => (
        <div className="product-description">
          <span className="product-name">{value || 'Descrição não informada'}</span>
          {row.description && (
            <small className="d-block text-muted product-details">
              {row.description.length > 50
                ? `${row.description.substring(0, 50)}...`
                : row.description
              }
            </small>
          )}
        </div>
      )
    },
    {
      key: 'icon',
      header: '',
      sortable: false,
      width: '50px',
      render: (_value: string, row: Product) => (
        <span
          className="d-flex justify-content-center align-items-center icon-lupa"
          onClick={() => setSelectedProduct(row.CODIGOPRD || '')}
          title="Ver detalhes"
        >
          🔍
        </span>
      )
    },
  ];

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const rawUser = sessionStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user[0]?.CODUSUARIO || !user?.password) {
        throw new Error('Usuário não autenticado');
      }

      const response = await getAllProducts();
      let productsData: Product[] = [];

      if (Array.isArray(response)) {
        productsData = response;
      } else if (response && typeof response === 'object') {
        productsData = response.data || response.products || response.items || [response];
      } else {
        console.warn('Formato de dados inesperado:', response);
        productsData = [];
      }
      setProducts(productsData);
    } catch (err) {
      setError('Erro ao carregar os dados dos produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Row className="m-0">
        <Col>
          {error && (
            <Alert variant="danger" className="d-flex align-items-center gap-2">
              ⚠️ {error}
            </Alert>
          )}

          <Row className="mb-3 row-header-products d-flex justify-content-end align-items-end">
            <Col className="">
              <Badge
                bg={selectedProducts.length > 0 ? "primary" : "secondary"}
                className="selection-badge"
              >
                <Package size={14} className="me-1" />
                {selectedProducts.length} produto(s) selecionado(s)
              </Badge>

            </Col>
            {selectedProducts.length > 0 && canInclude && (
              <Col className="d-flex justify-content-end align-items-top">
                <Button
                  variant="success"
                  onClick={handleProceedToRequest}
                  className="procceed-btn"
                >
                  <ShoppingCart size={16} className="me-1" />
                  Prosseguir com Requisição
                </Button>
              </Col>
            )}
          </Row>

          <DataTable
            data={products}
            columns={columns}
            loading={loading}
            itemsPerPage={15}
            searchable={true}
            className="products-table"
          />

          {!loading && products.length === 0 && !error && (
            <div className="text-center py-5 empty-state">
              <div className="display-1 text-muted mb-3">📦</div>
              <h5 className="text-muted">Nenhum produto encontrado</h5>
              <p className="text-muted">
                Ainda não há produtos cadastrados no sistema.
              </p>
            </div>
          )}
        </Col >
      </Row >

      <ProductModal
        show={showProductModal}
        onClose={handleCloseProductModal}
        CODIGOPRD={selectedProduct}
      />
    </>
  );
}