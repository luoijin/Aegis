import React, { useState, useEffect } from 'react';
import { Plus, Search, UserPlus, Trash2, X } from 'lucide-react';
import api from '../../../../services/api';
// Import your existing Button and Modal components
import Button from '../../../common/Button/Button';
import Input from '../../../common/Input/Input';
// If you don't have a Modal component, we'll use a simple div for now

export const DoctorPatientManagement = ({ doctorId, onPatientChange }) => {
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchAvailablePatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctor/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchAvailablePatients = async () => {
    try {
      const response = await api.get('/patients/all/for-selection');
      setAllPatients(response.data);
    } catch (error) {
      console.error('Error fetching available patients:', error);
    }
  };

  const addPatient = async (patientId) => {
    setLoading(true);
    try {
      await api.post(`/patients/${patientId}/assign-doctor`);
      await fetchPatients();
      setShowAddModal(false);
      if (onPatientChange) onPatientChange();
    } catch (error) {
      console.error('Error adding patient:', error);
      alert(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const removePatient = async (patientId) => {
    setLoading(true);
    try {
      await api.delete(`/patients/${patientId}/remove-from-list`);
      await fetchPatients();
      setShowRemoveConfirm(null);
      if (onPatientChange) onPatientChange();
    } catch (error) {
      console.error('Error removing patient:', error);
      alert(error.response?.data?.message || 'Failed to remove patient');
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailablePatients = allPatients.filter(patient => 
    !patients.some(p => p._id === patient._id) &&
    (patient.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     patient.user?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>My Patients ({patients.length})</h3>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Add Patient
        </Button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        {patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <p>No patients assigned yet</p>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
              Add Your First Patient
            </Button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Patient Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Blood Type</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient._id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#64748B' }}>{patient.user?.email}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{patient.bloodType || 'Not specified'}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#EF4444' }}
                      onClick={() => setShowRemoveConfirm(patient)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Simple Add Patient Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Add Patient</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <Input
                placeholder="Search patients by name or email..."
                icon={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredAvailablePatients.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No available patients found</p>
              ) : (
                filteredAvailablePatients.map(patient => (
                  <div key={patient._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: 'white' }}>
                        {patient.user?.profile?.firstName?.[0]}{patient.user?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{patient.user?.email}</div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addPatient(patient._id)} loading={loading}>
                      Add to My List
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simple Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowRemoveConfirm(null)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '400px', width: '90%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to remove <strong>{showRemoveConfirm.user?.profile?.firstName} {showRemoveConfirm.user?.profile?.lastName}</strong> from your patient list?</p>
            <p style={{ fontSize: '13px', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '8px' }}>This patient will no longer appear in your dashboard.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
              <Button variant="outline" onClick={() => setShowRemoveConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => removePatient(showRemoveConfirm._id)} loading={loading}>Remove</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};