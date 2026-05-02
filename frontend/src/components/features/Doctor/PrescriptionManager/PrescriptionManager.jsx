import React, { useState, useEffect } from 'react';
import { FileText, Plus, Send, Download, Eye, X, CheckCircle, Clock } from 'lucide-react';
import { CreatePrescription } from './CreatePrescription';
import { generatePrescriptionPDF } from '../../../../utils/pdfGenerator';
import api from '../../../../services/api';
import './PrescriptionManager.css';

export const PrescriptionManager = ({ doctorId, patients }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/doctor/prescriptions');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async (prescriptionData) => {
    try {
      await api.post('/doctor/prescriptions', prescriptionData);
      setShowCreateForm(false);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert(error.response?.data?.message || 'Failed to create prescription');
    }
  };

  const handleSendToPatient = async (prescription) => {
    try {
      const patientUserId = prescription.patient?.user?._id;
      
      if (!patientUserId) {
        alert('Patient not found');
        return;
      }

      await api.post('/notifications', {
        recipient: patientUserId,
        type: 'prescription',
        title: 'New Prescription',
        message: `Dr. ${prescription.doctor?.profile?.firstName} ${prescription.doctor?.profile?.lastName} has issued a new prescription for you.`,
        data: { prescriptionId: prescription._id }
      });
      
      alert('✓ Prescription sent to patient successfully!');
    } catch (error) {
      console.error('Error sending prescription:', error);
      alert('Prescription created! (Notification feature coming soon)');
    }
  };

  const handleDownloadPDF = async (prescription) => {
    try {
      await generatePrescriptionPDF(prescription);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const activeCount = prescriptions.filter(p => p.isActive === true).length;

  return (
    <div className="prescription-manager">
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
      </div>

      {/* Prescriptions List - No Tabs */}
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
                        <span>{new Date(prescription.issuedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-badges">
                    <div className="card-actions">
                      <button className="action-btn" onClick={() => handleDownloadPDF(prescription)} title="Download PDF">
                        <Download size={16} />
                      </button>
                      <button className="action-btn send" onClick={() => handleSendToPatient(prescription)} title="Send to Patient">
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="medications-list">
                    {prescription.medications?.slice(0, 2).map((med, idx) => (
                      <div key={idx} className="medication-item">
                        <span className="med-name">{med.name}</span>
                        <span className="med-dosage">{med.dosage}</span>
                        <span className="med-frequency">{med.frequency}</span>
                      </div>
                    ))}
                    {prescription.medications?.length > 2 && (
                      <div className="more-meds">+{prescription.medications.length - 2} more medications</div>
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
                  {!isActive && (
                    <span className="completed-badge">Completed</span>
                  )}
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