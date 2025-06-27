import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './Pages/Home/Home';
import About from './Pages/About/About';
import Services from './Pages/Services/Services';
import Career from './Pages/Career/Career';
import Contact from './Pages/Contact/Contact';
import Enroll from './Pages/Enroll/Enroll';
import Admin from './Pages/Admin/Admin';
import LoginForm from './Pages/Admin/Components/LoginForm/LoginForm';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop';

// Component to handle conditional rendering of Navbar and Footer
const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/deltaAdmin');

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/career" element={<Career />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/deltaAdmin" element={<Navigate to="/deltaAdmin/login" replace />} />
        <Route path="/deltaAdmin/login" element={<LoginForm />} />
        <Route 
          path="/deltaAdmin/*" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
