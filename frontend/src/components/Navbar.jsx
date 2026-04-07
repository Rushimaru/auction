import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/" className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
          PPL-2026
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/players" className="nav-link">All Players</Link>

        {user ? (
          <>
            {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin Panel</Link>}
            {user.role === 'franchise' && <Link to="/franchise" className="nav-link">My Franchise</Link>}
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '5px 15px' }}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn btn-gold" style={{ padding: '5px 15px' }}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
