// frontend/src/components/features/Doctor/PrescriptionManager/PrescriptionManager.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Send, Download, Eye, X, CheckCircle, Clock } from 'lucide-react';
import { CreatePrescription } from './CreatePrescription';
import { generatePrescriptionPDF } from '../../../../utils/pdfGenerator';
import { confirmDialog } from '../../../../utils/confirmDialog';
import api from '../../../../services/api';
import './PrescriptionManager.css';

export const PrescriptionManager = ({ doctorId, patients }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/doctor/prescriptions');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      showError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async (prescriptionData) => {
    try {
      await api.post('/doctor/prescriptions', prescriptionData);
      setShowCreateForm(false);
      showSuccess('Prescription created successfully!');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error creating prescription:', error);
      showError(error.response?.data?.message || 'Failed to create prescription');
    }
  };

  const handleSendToPatient = async (prescription) => {
    const patientName = `${prescription.patient?.user?.profile?.firstName || ''} ${prescription.patient?.user?.profile?.lastName || ''}`.trim();
    
    const confirmed = await confirmDialog(
      'Send Prescription',
      `Are you sure you want to send this prescription to ${patientName || 'the patient'}?`,
      'info',
      'Yes, Send',
      'Cancel'
    );
    
    if (confirmed) {
      try {
        const patientUserId = prescription.patient?.user?._id;
        
        if (!patientUserId) {
          showError('Patient not found');
          return;
        }

        await api.post('/notifications', {
          recipient: patientUserId,
          type: 'prescription',
          title: 'New Prescription',
          message: `Dr. ${prescription.doctor?.profile?.firstName} ${prescription.doctor?.profile?.lastName} has issued a new prescription for you.`,
          data: { prescriptionId: prescription._id }
        });
        
        showSuccess('Prescription sent to patient successfully!');
      } catch (error) {
        console.error('Error sending prescription:', error);
        showSuccess('Prescription created! (Notification feature coming soon)');
      }
    }
  };

  const handleDownloadPDF = async (prescription) => {
    try {
      await generatePrescriptionPDF(prescription);
      // showSuccess('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Failed to generate PDF. Please try again.');
    }
  };

  const activeCount = prescriptions.filter(p => p.isActive === true).length;

  return (
    <div className="prescription-manager">
      {/* Success/Error Toast Messages */}
      {successMessage && <div className="success-toast">{successMessage}</div>}
      {errorMessage && <div className="error-toast">{errorMessage}</div>}

      {/* Header */}
      <div className="prescription-header">
        <div>
          <h2>Prescriptions</h2>
          <p>Create and manage digital prescriptions</p>
        </div>
        <button className="create-btn" onClick={() => setShowCreateForm(true)}>
          <Plus size={18} /> New Prescription
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-icon">
            <FileText size={20} />
          </div>
          <div>
            <div className="stat-value">{prescriptions.length}</div>
            <div className="stat-label">Total Prescriptions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active-icon">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="prescriptions-list">
        {loading ? (
          <div className="empty-state">Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>No prescriptions found</p>
            <span>Click "New Prescription" to create one</span>
          </div>
        ) : (
          prescriptions.map(prescription => {
            const patientName = `${prescription.patient?.user?.profile?.firstName || ''} ${prescription.patient?.user?.profile?.lastName || ''}`.trim();
            const doctorName = `${prescription.doctor?.profile?.firstName || ''} ${prescription.doctor?.profile?.lastName || ''}`.trim();
            const isActive = prescription.isActive;
            
            return (
              <div key={prescription._id} className={`prescription-card ${!isActive ? 'inactive' : ''}`}>
                <div className="card-header">
                  <div className="patient-info">
                    <div className="patient-initial">
                      {patientName.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="patient-name">{patientName || 'Unknown Patient'}</div>
                      <div className="prescription-date">
                        <Clock size={12} />
                        <span>{new Date(prescription.issuedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-badges">
                    {!isActive && <span className="completed-badge">Completed</span>}
                    <div className="card-actions">
                      <button className="action-btn download" onClick={() => handleDownloadPDF(prescription)} title="Download PDF">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="medications-list">
                    {prescription.medications?.slice(0, 3).map((med, idx) => (
                      <div key={idx} className="medication-item">
                        <span className="med-name">{med.name}</span>
                        <span className="med-dosage">{med.dosage}</span>
                        <span className="med-frequency">{med.frequency}</span>
                      </div>
                    ))}
                    {prescription.medications?.length > 3 && (
                      <div className="more-meds">+{prescription.medications.length - 3} more medications</div>
                    )}
                  </div>
                  {prescription.notes && (
                    <div className="prescription-notes">
                      <strong>Notes:</strong> {prescription.notes}
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <span className="refills">Refills: {prescription.refillsRemaining || 0}</span>
                  <span className="doctor-name">Dr. {doctorName || 'Unknown'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Prescription Modal */}
      {showCreateForm && (
        <CreatePrescription
          patients={patients}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreatePrescription}
        />
      )}
    </div>
  );
};