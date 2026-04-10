import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Loader from '../components/Loader';

const Home = () => {
  const [franchises, setFranchises] = useState([]);
  const [recentSold, setRecentSold] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, pRes] = await Promise.all([
          api.get('/auction/franchises'),
          api.get('/auction/players/all')
        ]);
        setFranchises(fRes.data);

        // Filter sold players and take last 10 (or all) for marquee
        const sold = pRes.data.filter(p => p.franchise_id !== null);
        const marqueePlayers = sold.reverse().slice(0, 15);
        setRecentSold(marqueePlayers);
        
        // Calculate total images to wait for (Main Logo + Franchises + Marquee)
        setTotalImages(1 + fRes.data.length + marqueePlayers.filter(p => p.image).length);
        
      } catch (err) {
        console.error(err);
      } finally {
        // We handle loading end via image load tracker
      }
    };
    fetchData();
  }, []);

  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  const allLoaded = imagesLoaded >= totalImages && totalImages > 0;

  useEffect(() => {
    if (allLoaded) {
      setTimeout(() => setLoading(false), 300); // Smooth transition
    }
  }, [allLoaded]);

  return (
    <>
      {loading && <Loader text="Preparing PPL Stadium..." />}
      <div className="container" style={{ textAlign: 'center', visibility: loading ? 'hidden' : 'visible' }}>
      <motion.h1
        className="title gradient-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        શ્રી સમસ્ત મારુ પ્રજાપતિ પ્રગતિ મંડળ<br />PPL-2026
      </motion.h1>

      <motion.img
        src="/image/franchiese/samaj-logo.png"
        alt="Main Logo"
        className="glowing"
        style={{ width: '150px', marginBottom: '30px', borderRadius: '50%' }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        onLoad={handleImageLoad}
        onError={handleImageLoad}
      />

      {recentSold.length > 0 && (
        <div style={{ marginBottom: '40px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', padding: '10px 0' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '10px' }}>🔥 RECENT TRANSFERS 🔥</h3>
          <div className="marquee-container">
            <div className="marquee-content">
              {recentSold.map(player => (
                <div key={player._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', margin: '0 30px', background: 'rgba(0,0,0,0.8)', padding: '5px 15px', borderRadius: '25px', border: '1px solid var(--accent-gold)' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {player.image?.startsWith('http') ? (
                      <img 
                        src={player.image.replace('open?id=', 'thumbnail?id=').replace('/file/d/', '/thumbnail?id=').split('/view')[0]} 
                        alt="p" 
                        onLoad={handleImageLoad}
                        onError={handleImageLoad}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : player.image ? (
                      <img 
                        src={`/image/${player.image}`} 
                        alt="p" 
                        onLoad={handleImageLoad}
                        onError={handleImageLoad}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <i className="fas fa-user" style={{ fontSize: '15px' }}></i>
                    )}
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'white' }}>{player.full_name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>sold to</span>
                  <span style={{ color: 'var(--accent-gold)' }}>{player.franchise_id?.frenchises_name}</span>
                  <span style={{ background: 'var(--accent-gold)', color: 'black', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>₹{player.sold_price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '20px', color: 'var(--accent-gold)' }}>Franchises</h2>

      <div className="grid grid-cols-5">
        {franchises.map((franchise, idx) => (
          <motion.div
            key={franchise._id}
            className="glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h3 style={{ marginBottom: '15px' }}>{franchise.frenchises_name}</h3>
            <img
              src={`/image/franchiese/${franchise.logo}`}
              alt={franchise.frenchises_name}
              onLoad={handleImageLoad}
              onError={handleImageLoad}
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', border: '3px solid var(--accent-gold)' }}
            />
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Budget:</span>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>₹{franchise.remaining_amount} / {franchise.total_amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Players Count:</span>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{franchise.total_players}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </>
  );
};

export default Home;
