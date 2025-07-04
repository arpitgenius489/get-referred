import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function CreateReferrals() {
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    referralReason: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/referrals', {
        ...formData,
        userId: currentUser.uid,
      });
      setSuccess(true);
      setFormData({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        referralReason: '',
      });
    } catch (err) {
      setError('Failed to create referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className="create-referral">
      <h2>Create Referral</h2>
      {success && <div className="success-message">Referral created successfully!</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patientName">Patient Name</label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="patientEmail">Patient Email</label>
          <input
            type="email"
            id="patientEmail"
            name="patientEmail"
            value={formData.patientEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="patientPhone">Patient Phone</label>
          <input
            type="tel"
            id="patientPhone"
            name="patientPhone"
            value={formData.patientPhone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="referralReason">Reason for Referral</label>
          <textarea
            id="referralReason"
            name="referralReason"
            value={formData.referralReason}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Create Referral
        </button>
      </form>
    </div>
  );
}
