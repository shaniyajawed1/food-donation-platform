import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import DonorPortal from "./pages/DonorPortal";
import RecipientPortal from "./pages/RecipientPortal";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/donor" element={<DonorPortal />} />
              <Route path="/recipient" element={<RecipientPortal />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
         
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
