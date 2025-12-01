import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Produtos from "../pages/Products";

import PrivateRoute from "../middlewares/PrivateRoute";
import MainLayout from "../layouts/MainLayout";
import ProductRequest from "../pages/ProductsRequest";
import Cipa from "../pages/Cipa";
import UserGrafics from "../pages/UserGrafics";
import MyApprovals from "../pages/MyApprovals";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/products"
          element={
            <PrivateRoute>
              <MainLayout>
                <Produtos />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/product-request"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProductRequest />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/cipa"
          element={
            <PrivateRoute>
              <MainLayout>
                <Cipa />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/user-requests"
          element={
            <PrivateRoute>
              <MainLayout>
                <UserGrafics />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/minhas-aprovacoes"
          element={
            <PrivateRoute>
              <MainLayout>
                <MyApprovals />
              </MainLayout>
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}