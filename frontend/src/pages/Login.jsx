import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      if (res.role === 'admin') navigate('/admin');
      else navigate('/franchise');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="glass-panel" style={{ width: '400px' }}>
        <h2 className="title gradient-text" style={{ fontSize: '2rem' }}>Login</h2>
        {error && <p style={{ color: 'var(--error-color)', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
        <form onSubmit={onSubmit}>
          <div className="input-group">
            <input type="text" placeholder="Username" className="input-field" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
