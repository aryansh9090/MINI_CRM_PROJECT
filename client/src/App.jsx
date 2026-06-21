import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Kanban from './pages/Kanban';
import Analytics from './pages/Analytics';
import AiInsights from './pages/AiInsights';
import CrossInsights from './pages/CrossInsights';
import GoldenHour from './pages/GoldenHour';
import ConversionDNA from './pages/ConversionDNA';
import About from './pages/About';
import Layout from './components/Layout';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-insights" element={<AiInsights />} />
          <Route path="cross-insights" element={<CrossInsights />} />
          <Route path="golden-hour" element={<GoldenHour />} />
          <Route path="conversion-dna" element={<ConversionDNA />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
