import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import PublicPlayers from './pages/PublicPlayers';
import FranchisePanel from './pages/FranchisePanel';
import AdminAuction from './pages/AdminAuction';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" 
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #fbbf24'
            }
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/players" element={<PublicPlayers />} />
          <Route path="/franchise" element={<FranchisePanel />} />
          <Route path="/admin" element={<AdminAuction />} />
        </Routes>
        <footer className="footer">
          Design by <span>Rushi Maru</span>
        </footer>
      </Router>
    </AuthProvider>
  );
}

export default App;
