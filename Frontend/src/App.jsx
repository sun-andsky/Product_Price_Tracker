import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React from "react";
import SearchResultPage from "./pages/SearchResultPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MainPage from "./pages/MainPage";
import Nav from './components/Nav';
import Signup from "./pages/SignupPage";
import Login from "./pages/LoginPage";
import WishlistPage from "./pages/WishlistPage";
import UserProfile from './pages/UserProfile';
import { AuthProvider } from "./context/AuthContext";
import { useLocation } from "react-router-dom";

// Move Layout INSIDE Routes for reactivity
function Layout({ children }) {
  const location = useLocation();
  const hideNav = ["/signup", "/login"].includes(location.pathname);

  return (
    <>
      {!hideNav && <Nav />}
      {children}
    </>
  );
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/search" element={<SearchResultPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
      <ToastContainer
        position="bottom-center"
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
