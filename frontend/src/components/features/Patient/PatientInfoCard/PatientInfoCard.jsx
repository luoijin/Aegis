// frontend/src/components/features/Patient/PatientInfoCard/PatientInfoCard.jsx
import React, { useState, useEffect } from 'react';
import { User, Stethoscope, Droplet, Phone, Mail, Building, BriefcaseMedical, Calendar, Heart, AlertCircle, Edit2, Save, X, UserCircle } from 'lucide-react';
import api from '../../../../services/api';
import './PatientInfoCard.css';

export const PatientInfoCard = ({ onRefresh }) => {
  const [patientData, setPatientData] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  // Fetch patient data from API
  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/profile');
      const data = response.data;
      
      setPatientData(data);
      setDoctor(data.assignedDoctor);
      setUser(data.user);
      
      // Initialize form data
      setFormData({
        firstName: data.user?.profile?.firstName || '',
        lastName: data.user?.profile?.lastName || '',
        phone: data.user?.profile?.phone || '',
        dateOfBirth: data.user?.profile?.dateOfBirth ? new Date(data.user.profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: data.user?.profile?.gender || '',
        emergencyContact: {
          name: data.emergencyContact?.name || '',
          relationship: data.emergencyContact?.relationship || '',
          phone: data.emergencyContact?.phone || ''
        }
      });
      
      if (onRefresh) onRefresh(data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/patient/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        emergencyContact: formData.emergencyContact
      });
      
      await fetchPatientData(); // Refresh data
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString();
  };

  const age = calculateAge(user?.profile?.dateOfBirth);

  if (loading) {
    return (
      <div className="patient-info-card">
        <div className="card-header">
          <h3>Your Information</h3>
        </div>
        <div className="info-grid" style={{ padding: '40px', textAlign: 'center' }}>
          Loading your information...
        </div>
      </div>
    );
  }

  return (
    <div className="patient-info-card">
      <div className="card-header">
        <h3>Your Information</h3>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="edit-form-grid">
            {/* Personal Information Section */}
            <div className="form-section">
              <h4><UserCircle size={16} /> Personal Information</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Contact number"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="form-section">
              <h4><AlertCircle size={16} /> Emergency Contact</h4>
              
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="emergency_name"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                  placeholder="Emergency contact person"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Relationship</label>
                  <input
                    type="text"
                    name="emergency_relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="emergency_phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
              <X size={16} /> Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isSaving}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="info-grid">
          <div className="info-column">
            <div className="info-section-title">
              <span>Personal Details</span>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <User size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Full Name</span>
                <span className="info-value">{user?.profile?.firstName} {user?.profile?.lastName}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Mail size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Email Address</span>
                <span className="info-value">{user?.email}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Phone size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{user?.profile?.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Calendar size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Date of Birth</span>
                <span className="info-value">{formatDate(user?.profile?.dateOfBirth)}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Heart size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Age / Gender</span>
                <span className="info-value">
                  {age ? `${age} years old` : 'Age not set'} • {user?.profile?.gender || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Droplet size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Blood Type</span>
                <span className="info-value">{patientData?.bloodType && patientData.bloodType !== '' ? patientData.bloodType : 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className="info-column">
            <div className="info-section-title">
              <span>Primary Care Physician</span>
            </div>

            {doctor ? (
              <>
                <div className="info-item">
                  <div className="info-icon">
                    <Stethoscope size={16} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Doctor Name</span>
                    <span className="info-value">Dr. {doctor?.profile?.firstName} {doctor?.profile?.lastName}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <BriefcaseMedical size={16} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Specialization</span>
                    <span className="info-value">{doctor?.specialization || 'General Medicine'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Mail size={16} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{doctor?.email}</span>
                  </div>
                </div>

                {/* Emergency Contact Section in View Mode */}
                <div className="info-section-title" style={{ marginTop: 20 }}>
                  <span>Emergency Contact</span>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <AlertCircle size={16} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Contact Name</span>
                    <span className="info-value">{patientData?.emergencyContact?.name || 'Not provided'}</span>
                  </div>
                </div>

                {patientData?.emergencyContact?.name && (
                  <>
                    <div className="info-item">
                      <div className="info-icon">
                        <User size={16} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Relationship</span>
                        <span className="info-value">{patientData?.emergencyContact?.relationship || 'Not specified'}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">
                        <Phone size={16} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Emergency Phone</span>
                        <span className="info-value">{patientData?.emergencyContact?.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-doctor">
                <Stethoscope size={32} />
                <p>No doctor assigned yet</p>
                <span>Your primary care physician will appear here</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};