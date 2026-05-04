// frontend/src/components/features/Doctor/PrescriptionManager/PrescriptionList.jsx
import React from 'react';
import { FileText, Printer, Send } from 'lucide-react';
import './PrescriptionList.css';

export const PrescriptionList = ({ prescriptions, loading, onSelect }) => {
  if (loading) {
    return <div className="loading">Loading prescriptions...</div>;
  }

  if (prescriptions.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} />
        <p>No prescriptions yet</p>
        <p className="hint">Click "New Prescription" to create one</p>
      </div>
    );
  }

  return (
    <div className="prescription-list">
      <h3>Recent Prescriptions</h3>
      {prescriptions.slice(0, 10).map(prescription => (
        <div key={prescription._id} className="prescription-card">
          <div className="prescription-header">
            <div>
              <h4>{prescription.patient?.user?.profile?.firstName} {prescription.patient?.user?.profile?.lastName}</h4>
              <p className="date">{new Date(prescription.issuedDate).toLocaleDateString()}</p>
            </div>
            <div className="prescription-actions">
              <button className="action-btn" title="Print" onClick={() => onSelect(prescription)}>
                <Printer size={16} />
              </button>

            </div>
          </div>
          <div className="prescription-body">
            <div className="medications-list">
              {prescription.medications?.slice(0, 3).map((med, idx) => (
                <div key={idx} className="medication-item">
                  <strong>{med.name}</strong> - {med.dosage} - {med.frequency}
                </div>
              ))}
              {prescription.medications?.length > 3 && (
                <div className="more-meds">+{prescription.medications.length - 3} more</div>
              )}
            </div>
            {prescription.notes && (
              <div className="prescription-notes">
                <strong>Notes:</strong> {prescription.notes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};