import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFollowedSellers } from '../../services/followService';
import { getSellerById } from '../../services/sellerService';
import SellerCard from '../../components/seller/SellerCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useGeolocation } from '../../hooks/useGeolocation';
import './FollowingList.css';

export default function FollowingList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { position, getCurrentPosition } = useGeolocation();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentPosition().catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchFollowing = async () => {
      setLoading(true);
      try {
        const follows = await getFollowedSellers(user.uid);
        // Fetch each seller's full data
        const sellerPromises = follows.map((f) => getSellerById(f.sellerId));
        const sellerData = await Promise.all(sellerPromises);
        setSellers(sellerData.filter(Boolean));
      } catch (error) {
        console.error('Failed to fetch following:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, [user]);

  if (!user) {
    return (
      <div className="following-page page-enter">
        <div className="container">
          <div className="following-empty">
            <span className="following-empty-icon">⭐</span>
            <h2>Ikuti penjual favoritmu</h2>
            <p>Login untuk mengikuti penjual dan mendapat notifikasi saat mereka buka</p>
            <Button variant="primary" onClick={() => navigate('/welcome')}>
              Masuk dengan Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat daftar..." />;
  }

  return (
    <div className="following-page page-enter">
      <div className="container">
        <h1 className="following-title">Penjual Diikuti</h1>

        {sellers.length === 0 ? (
          <div className="following-empty">
            <span className="following-empty-icon">⭐</span>
            <h3>Belum mengikuti siapa pun</h3>
            <p>Jelajahi penjual di sekitarmu dan ikuti yang kamu suka!</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Jelajahi Penjual
            </Button>
          </div>
        ) : (
          <div className="following-list stagger-children">
            {sellers.map((seller) => (
              <SellerCard
                key={seller.id}
                seller={seller}
                buyerLocation={position}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
