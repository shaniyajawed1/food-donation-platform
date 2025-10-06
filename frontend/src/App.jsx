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
import About from "./pages/About";
import Contact from "./pages/Contact";
import { Toaster } from "react-hot-toast";
import MyDonations from "./components/donor/Donations-List";
import MyImpact from "./components/donor/MyImpact";
import FindFood from "./components/recipient/FindFood";
import FoodListingDetails from "./components/recipient/FoodListingDetails";
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#1f2937",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "16px",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: {
                style: {
                  background: "#f0fdf4",
                  color: "#166534",
                  border: "1px solid #bbf7d0",
                },
                iconTheme: {
                  primary: "#16a34a",
                  secondary: "#f0fdf4",
                },
              },
              error: {
                style: {
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                },
                iconTheme: {
                  primary: "#dc2626",
                  secondary: "#fef2f2",
                },
              },
            }}
          />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/donor/dashboard" element={<DonorPortal />} />
              <Route path="/donor/donations" element={<MyDonations />} />
              <Route
                path="/recipient/dashboard"
                element={<RecipientPortal />}
              />
              <Route path="/recipient/food-listings" element={<FindFood />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/recipient/food-listings/:id"
                element={<FoodListingDetails />}
              />
              <Route path="/about" element={<About />} />
              <Route path="/donor/impact" element={<MyImpact />} />
              <Route path="/register" element={<Register />} />

              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
