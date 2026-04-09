import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const AdminAuction = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [franchises, setFranchises] = useState([]);
  
  const [selectedFranchise, setSelectedFranchise] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [flashing, setFlashing] = useState(false);
  
  const [roles, setRoles] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async (role = roleFilter) => {
    try {
      const [franchiseRes, allPlayersRes] = await Promise.all([
        api.get('/auction/franchises'),
        api.get('/auction/players/all')
      ]);
      
      const allPlayers = allPlayersRes.data;
      const unsoldPlayers = allPlayers.filter(p => !p.franchise_id && p.unsold_status === 0);
      
      // Determine the next player based on the role filter
      const targetPlayer = role 
        ? unsoldPlayers.find(p => p.playing_role === role) 
        : unsoldPlayers[0];
        
      setCurrentPlayer(targetPlayer || null);
      setFranchises(franchiseRes.data);
      
      if (roles.length === 0) {
        setRoles([...new Set(allPlayers.map(p => p.playing_role))].filter(Boolean));
      }
      setMessage('');
      setPrice('');
      setSelectedFranchise('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    if (!selectedFranchise || !price) {
      toast.error('Please select a franchise and enter a price');
      return;
    }

    try {
      await api.post('/auction/players/sell', {
        player_id: currentPlayer._id,
        franchise_id: selectedFranchise,
        price: Number(price)
      });
      setFlashing(true);
      setTimeout(() => setFlashing(false), 500);
      toast(`${currentPlayer.full_name} Sold!`, { className: 'toast-sold', icon: '🔥' });
      fetchData(); // load next player
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error selling player');
    }
  };

  const handleUnsold = async () => {
    if (!window.confirm('Mark this player as Unsold?')) return;
    try {
      await api.post('/auction/players/unsold', { player_id: currentPlayer._id });
      setFlashing(true);
      setTimeout(() => setFlashing(false), 500);
      toast(`${currentPlayer.full_name} Marked Unsold`, { className: 'toast-unsold', icon: '❌' });
      fetchData();
    } catch (err) {
      toast.error('Error marking unsold');
    }
  };

  return (
    <div className="container">
      {flashing && <div className="flash-screen"></div>}
      <h2 className="title gradient-text">Live Auction Control Room</h2>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '15px' }}>
        <h3 style={{ color: 'var(--text-main)', margin: 0, alignSelf: 'center' }}>🎯 Filter Next Player By Role:</h3>
        <select 
          className="input-field" 
          style={{ width: '250px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--accent-gold)' }}
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            fetchData(e.target.value);
          }}
        >
          <option value="">-- All Roles --</option>
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {message && <div style={{ background: 'var(--error-color)', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}

      <div className="grid grid-cols-2">
        {/* Left Side: Current Player */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--accent-gold)' }}>Player on Board</h3>
          
          {currentPlayer ? (
            <>
            {currentPlayer.image?.startsWith('http') ? (
              <img 
                src={currentPlayer.image.replace('open?id=', 'thumbnail?id=').replace('/file/d/', '/thumbnail?id=').split('/view')[0]} 
                alt="Player" 
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '10px', marginBottom: '20px' }} 
              />
            ) : currentPlayer.image ? (
              <img 
                src={`/image/${currentPlayer.image}`} 
                alt="Player" 
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '10px', marginBottom: '20px' }} 
                onError={e => { e.target.parentElement.innerHTML = '<i class="fas fa-user" style="font-size: 150px; color: var(--text-muted); margin-bottom: 20px;"></i>'; }}
              />
            ) : (
              <div style={{ width: '100%', height: '300px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <i className="fas fa-user-tie" style={{ fontSize: '120px', color: 'var(--text-muted)' }}></i>
              </div>
            )}
              <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{currentPlayer.full_name}</h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Role: {currentPlayer.playing_role} | Age: {currentPlayer.age} | Zone: {currentPlayer.zone_name}
              </p>

              <div style={{ width: '100%', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                  <form onSubmit={handleSell} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select 
                      className="input-field" 
                      style={{ background: 'var(--bg-secondary)', color: 'white' }}
                      value={selectedFranchise}
                      onChange={(e) => setSelectedFranchise(e.target.value)}
                    >
                      <option value="">-- Select Franchise --</option>
                      {franchises.map(f => (
                        <option key={f._id} value={f._id}>{f.frenchises_name} (Bal: {f.remaining_amount})</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="Enter Final Price" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px' }}>MARK AS SOLD</button>
                  </form>
                </div>
                <button 
                  onClick={handleUnsold} 
                  className="btn btn-danger" 
                  style={{ fontSize: '1.2rem', padding: '15px' }}
                >
                  MARK AS UNSOLD
                </button>
              </div>
            </>
          ) : (
            <h3 style={{ color: 'var(--text-muted)' }}>
              {roleFilter ? `All players with role "${roleFilter}" have been auctioned!` : 'All players have been auctioned!'}
            </h3>
          )}
        </div>

        {/* Right Side: Franchise Boards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ textAlign: 'center', color: 'var(--accent-gold)' }}>Franchise Status</h3>
          {franchises.map(f => (
            <div key={f._id} className="glass-panel" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={`/image/franchiese/${f.logo}`} alt="logo" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--accent-gold)' }} onError={e => e.target.style.display='none'}/>
                <div>
                  <h4 style={{ margin: 0 }}>{f.frenchises_name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Players: {f.total_players}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ margin: 0, color: 'var(--accent-gold)' }}>₹{f.remaining_amount}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Remaining</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAuction;
