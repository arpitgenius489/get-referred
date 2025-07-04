import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function ProvideReferrals() {
  const { currentUser } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/referrals`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        setReferrals(response.data);
      } catch (error) {
        console.error('Error fetching referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.token]);

  if (loading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div>
      <h1>Provide Referrals</h1>
      {referrals.length === 0 ? (
        <p>No referrals found.</p>
      ) : (
        <ul>
          {referrals.map((referral) => (
            <li key={referral.id}>{referral.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
