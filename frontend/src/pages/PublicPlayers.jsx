import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Loader from '../components/Loader';

const PublicPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  
  const [filter, setFilter] = useState('all'); // all, sold, unsold, remaining
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' or specific role
  const [franchiseFilter, setFranchiseFilter] = useState('all'); // 'all' or franchise ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, franchisesRes] = await Promise.all([
          api.get('/auction/players/all'),
          api.get('/auction/franchises')
        ]);
        setPlayers(playersRes.data);
        setFranchises(franchisesRes.data);
        // We set initial loading to false once data is here, 
        // but imageLoading is separate. 
        // Actually, for All Players, I'll release loader after data + a small grace period 
        // because waiting for 100+ images is too slow.
        setTimeout(() => setLoading(false), 800);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (type, value) => {
    setIsFiltering(true);
    if (type === 'status') {
      setFilter(value);
      setFranchiseFilter('all');
    } else if (type === 'role') {
      setRoleFilter(value);
    } else if (type === 'franchise') {
      setFranchiseFilter(value);
      if (value !== 'all') setFilter('none');
      else setFilter('all');
    }
    
    // Dim the UI for 500ms to show it's updating
    setTimeout(() => setIsFiltering(false), 500);
  };

  const filteredPlayers = players.filter(p => {
    let matchStatus = true;
    if (filter === 'sold') matchStatus = p.franchise_id !== null;
    else if (filter === 'unsold') matchStatus = p.unsold_status === 1;
    else if (filter === 'remaining') matchStatus = p.franchise_id === null && p.unsold_status === 0;

    let matchRole = true;
    if (roleFilter !== 'all') matchRole = p.playing_role === roleFilter;
    
    let matchFranchise = true;
    if (franchiseFilter !== 'all') {
      matchFranchise = p.franchise_id && p.franchise_id._id === franchiseFilter;
    }

    return matchStatus && matchRole && matchFranchise;
  });

  const availableRoles = [...new Set(players.map(p => p.playing_role))].filter(Boolean);

  const topSignings = [...players]
    .filter(p => p.franchise_id !== null)
    .sort((a, b) => b.sold_price - a.sold_price)
    .slice(0, 3);

  return (
    <div className="container">
      {(loading || isFiltering) && <Loader text={isFiltering ? "Updating Player List..." : "Finalizing Team Sheets..."} />}
      <h2 className="title gradient-text">PPL-2026 Player Roster</h2>
      
      {filter === 'all' && topSignings.length > 0 && (
        <div style={{ marginBottom: '50px' }}>
          <h3 style={{ textAlign: 'center', color: 'var(--accent-gold)', marginBottom: '30px' }}>🏆 Blockbuster Signings 🏆</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', height: '250px' }}>

            {/* Rank 2 (Silver) */}
            {topSignings[1] && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel" style={{ width: '200px', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderTop: '4px solid silver' }}>
                <img 
                  src={topSignings[1].image ? `/image/${topSignings[1].image}` : 'https://via.placeholder.com/60'} 
                  alt="P2" 
                  onLoad={() => setImagesLoaded(prev => prev + 1)}
                  onError={() => setImagesLoaded(prev => prev + 1)}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '10px' }} 
                />
                <h4 style={{ margin: 0, textAlign: 'center' }}>{topSignings[1].full_name}</h4>
                <strong style={{ color: 'silver', fontSize: '1.2rem' }}>₹{topSignings[1].sold_price}</strong>
              </motion.div>
            )}

            {/* Rank 1 (Gold) */}
            {topSignings[0] && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel" style={{ width: '240px', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(217,119,6,0.05)', borderTop: '6px solid gold', boxShadow: '0 0 30px rgba(217,119,6,0.1)' }}>
                <div style={{ position: 'absolute', top: '-15px', background: 'gold', color: 'black', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>1</div>
                <img 
                  src={topSignings[0].image ? `/image/${topSignings[0].image}` : 'https://via.placeholder.com/80'} 
                  alt="P1" 
                  onLoad={() => setImagesLoaded(prev => prev + 1)}
                  onError={() => setImagesLoaded(prev => prev + 1)}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', border: '2px solid gold' }} 
                />
                <h3 style={{ margin: 0, textAlign: 'center', fontSize: '1.4rem' }}>{topSignings[0].full_name}</h3>
                <strong style={{ color: 'gold', fontSize: '1.5rem' }}>₹{topSignings[0].sold_price}</strong>
              </motion.div>
            )}

            {/* Rank 3 (Bronze) */}
            {topSignings[2] && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel" style={{ width: '200px', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderTop: '4px solid #cd7f32' }}>
                <img 
                  src={topSignings[2].image ? `/image/${topSignings[2].image}` : 'https://via.placeholder.com/50'} 
                  alt="P3" 
                  onLoad={() => setImagesLoaded(prev => prev + 1)}
                  onError={() => setImagesLoaded(prev => prev + 1)}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', marginBottom: '10px' }} 
                />
                <h4 style={{ margin: 0, textAlign: 'center' }}>{topSignings[2].full_name}</h4>
                <strong style={{ color: '#cd7f32', fontSize: '1.1rem' }}>₹{topSignings[2].sold_price}</strong>
              </motion.div>
            )}

          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
        <button className={`btn ${filter === 'all' ? 'btn-gold' : 'btn-outline'}`} onClick={() => handleFilterChange('status', 'all')}>All Status</button>
        <button className={`btn ${filter === 'sold' ? 'btn-gold' : 'btn-outline'}`} onClick={() => handleFilterChange('status', 'sold')}>Sold</button>
        <button className={`btn ${filter === 'remaining' ? 'btn-gold' : 'btn-outline'}`} onClick={() => handleFilterChange('status', 'remaining')}>Remaining</button>
        <button className={`btn ${filter === 'unsold' ? 'btn-gold' : 'btn-outline'}`} onClick={() => handleFilterChange('status', 'unsold')}>Unsold</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <select 
          className="input-field" 
          style={{ width: '250px', background: '#ffffff', border: '1px solid var(--accent-gold)' }}
          value={roleFilter}
          onChange={(e) => handleFilterChange('role', e.target.value)}
        >
          <option value="all">-- All Roles --</option>
          {availableRoles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        
        <select 
          className="input-field" 
          style={{ width: '250px', background: '#ffffff', border: '1px solid var(--accent-gold)' }}
          value={franchiseFilter}
          onChange={(e) => handleFilterChange('franchise', e.target.value)}
        >
          <option value="all">-- All Franchises --</option>
          {franchises.map(f => (
            <option key={f._id} value={f._id}>{f.frenchises_name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4">
        {filteredPlayers.map((player, idx) => (
          <motion.div
            key={player._id}
            className="glass-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {player.image?.startsWith('http') ? (
                <img
                  src={player.image.replace('open?id=', 'thumbnail?id=').replace('/file/d/', '/thumbnail?id=').split('/view')[0]}
                  alt={player.full_name}
                  onLoad={() => setImagesLoaded(prev => prev + 1)}
                  onError={() => setImagesLoaded(prev => prev + 1)}
                  style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', marginBottom: '15px', border: '3px solid var(--accent-gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
              ) : player.image ? (
                <img
                  src={`/image/${player.image}`}
                  alt={player.full_name}
                  onLoad={() => setImagesLoaded(prev => prev + 1)}
                  onError={() => setImagesLoaded(prev => prev + 1)}
                  style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', marginBottom: '15px', border: '3px solid var(--accent-gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
            ) : (
              <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                <i className="fas fa-user" style={{ fontSize: '60px', color: 'var(--text-muted)' }}></i>
              </div>
            )}
            <h3 style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: '10px' }}>{player.full_name}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{player.playing_role}</p>

            {player.franchise_id ? (
              <div style={{ marginTop: '15px', background: '#ecfdf5', padding: '10px', borderRadius: '8px', width: '100%', textAlign: 'center', border: '1px solid #10b981' }}>
                <strong style={{ color: '#047857' }}>Sold: ₹{player.sold_price}</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '5px', color: '#065f46' }}>Team: {player.franchise_id.frenchises_name}</p>
              </div>
            ) : player.unsold_status === 1 ? (
              <div style={{ marginTop: '15px', background: '#fef2f2', padding: '10px', borderRadius: '8px', width: '100%', textAlign: 'center', border: '1px solid #ef4444' }}>
                <strong style={{ color: '#b91c1c' }}>Unsold</strong>
              </div>
            ) : (
              <div style={{ marginTop: '15px', background: '#f8fafc', padding: '10px', borderRadius: '8px', width: '100%', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: 'var(--text-main)' }}>Available</strong>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PublicPlayers;
