import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const FranchisePanel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [franchiseData, setFranchiseData] = useState(null);
  const [myPlayers, setMyPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'franchise') {
      navigate('/');
      return;
    }

    const fetchMyData = async () => {
      try {
        const res = await api.get(`/auth/user`);
        // We know user id is their franchise id if role is franchise
        const fRes = await api.get(`/auction/franchises/${res.data._id}`);
        setFranchiseData(fRes.data.franchise);
        setMyPlayers(fRes.data.players);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyData();
  }, [user, navigate]);

  if (loading) return <div className="container"><h2 className="title">Loading Dashboard...</h2></div>;

  return (
    <div className="container">
      <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '30px' }}>
        <img 
          src={`/image/franchiese/${franchiseData.logo}`} 
          alt="Logo" 
          style={{ width: '150px', borderRadius: '10px', border: '3px solid var(--accent-gold)' }} 
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div style={{ flex: 1 }}>
          <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{franchiseData.frenchises_name} Dashboard</h2>
          <div style={{ display: 'flex', gap: '20px', fontSize: '1.2rem', marginBottom: '15px' }}>
            <p>Total Budget: <strong style={{color: 'white'}}>{franchiseData.total_amount}</strong></p>
            <p>Remaining: <strong style={{color: 'var(--accent-gold)'}}>{franchiseData.remaining_amount}</strong></p>
            <p>Squad Size: <strong style={{color: 'white'}}>{franchiseData.total_players}</strong></p>
          </div>
          
          {/* Budget Progress Bar */}
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '20px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <div style={{ 
              width: `${((franchiseData.total_amount - franchiseData.remaining_amount) / franchiseData.total_amount) * 100}%`, 
              background: 'linear-gradient(90deg, #ef4444, #fbbf24)', 
              height: '100%', 
              transition: 'width 0.5s ease-in-out',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
            }}></div>
          </div>
          <p style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Budget Depletion Tracker</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '20px', color: 'var(--accent-gold)' }}>My Squad / Purchased Players</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Role</th>
            <th>Zone</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {myPlayers.length > 0 ? myPlayers.map(p => (
            <tr key={p._id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={`/image/${p.image}`} alt={p.full_name} style={{ width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover' }} onError={(e) => { e.target.src='https://via.placeholder.com/40' }}/>
                  {p.full_name}
                </div>
              </td>
              <td>{p.playing_role}</td>
              <td>{p.zone_name}</td>
              <td style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>₹{p.sold_price}</td>
            </tr>
          )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No players purchased yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default FranchisePanel;
