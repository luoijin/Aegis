import React, { useEffect, useState } from 'react';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import api from '../../../utils/api';
import './PatientList.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    bloodType: '',
    allergies: [],
    emergencyContact: { name: '', relationship: '', phone: '' }
  });
  const [allergyInput, setAllergyInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient._id}`, formData);
      } else {
        await api.post('/patients', formData);
      }
      fetchPatients();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      bloodType: '',
      allergies: [],
      emergencyContact: { name: '', relationship: '', phone: '' }
    });
    setEditingPatient(null);
  };

  const filteredPatients = patients.filter(patient =>
    patient.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Patient Management</h2>
        <div className="header-actions">
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button onClick={() => {
            resetForm();
            setShowModal(true);
          }} variant="primary">
            + Add Patient
          </Button>
        </div>
      </div>

      <div className="patients-grid">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="empty-state">
            <p>No patients found</p>
            <Button onClick={() => setShowModal(true)} variant="primary">
              Add Your First Patient
            </Button>
          </div>
        ) : (
          filteredPatients.map(patient => (
            <div key={patient._id} className="patient-card fade-in">
              <div className="patient-card-header">
                <div className="patient-avatar">
                  {patient.user?.profile?.firstName?.[0]}{patient.user?.profile?.lastName?.[0]}
                </div>
                <div className="patient-actions">
                  <button 
                    className="icon-btn edit"
                    onClick={() => {
                      setEditingPatient(patient);
                      setFormData({
                        userId: patient.user?._id,
                        bloodType: patient.bloodType,
                        allergies: patient.allergies,
                        emergencyContact: patient.emergencyContact
                      });
                      setShowModal(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button 
                    className="icon-btn delete"
                    onClick={() => handleDelete(patient._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="patient-card-body">
                <h3>{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</h3>
                <p className="patient-email">{patient.user?.email}</p>
                <div className="patient-details">
                  <span className="detail-badge">🩸 {patient.bloodType || 'N/A'}</span>
                  <span className="detail-badge">📞 {patient.user?.profile?.phone || 'N/A'}</span>
                </div>
                {patient.allergies?.length > 0 && (
                  <div className="patient-allergies">
                    <strong>Allergies:</strong> {patient.allergies.join(', ')}
                  </div>
                )}
              </div>
              <div className="patient-card-footer">
                <Button variant="outline" size="sm">View Records</Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Add/Edit Patient */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>User ID (from registered user)</label>
                <Input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="Enter user ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Blood Type</label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="select-input"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label>Allergies</label>
                <div className="allergies-input">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    placeholder="Enter allergy"
                    onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                  />
                  <Button type="button" onClick={addAllergy} size="sm">Add</Button>
                </div>
                <div className="allergies-list">
                  {formData.allergies.map((allergy, index) => (
                    <span key={index} className="allergy-tag">
                      {allergy}
                      <button type="button" onClick={() => removeAllergy(index)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h4>Emergency Contact</h4>
                <Input
                  label="Name"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                  })}
                />
                <Input
                  label="Relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                  })}
                />
                <Input
                  label="Phone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                  })}
                />
              </div>

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingPatient ? 'Update' : 'Create'} Patient
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;