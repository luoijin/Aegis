// frontend/src/components/features/Patient/PatientPrescriptions/PatientPrescriptions.jsx
import React from 'react';
import { FileText, Download } from 'lucide-react';
import './PatientPrescriptions.css';

export const PatientPrescriptions = ({ prescriptions }) => {
  if (prescriptions.length === 0) {
    return (
      <div className="prescriptions-card">
        <h3>Prescriptions</h3>
        <div className="empty-state">
          <FileText size={48} />
          <p>No prescriptions available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prescriptions-card">
      <h3>Prescriptions</h3>
      
      <div className="prescriptions-list">
        {prescriptions.map(prescription => (
          <div key={prescription._id} className="prescription-item">
            <div className="prescription-header">
              <div className="prescription-icon">
                <FileText size={20} />
              </div>
              <div>
                <div className="prescription-date">
                  {new Date(prescription.issuedDate).toLocaleDateString()}
                </div>
                <div className="prescription-status">
                  {prescription.isActive ? 'Active' : 'Completed'}
                </div>
              </div>
            </div>
            
            <div className="prescription-medications">
              {prescription.medications?.map((med, idx) => (
                <div key={idx} className="medication-line">
                  <strong>{med.name}</strong> - {med.dosage} - {med.frequency}
                </div>
              ))}
            </div>
            
            {prescription.notes && (
              <div className="prescription-notes">
                <strong>Notes:</strong> {prescription.notes}
              </div>
            )}
            
            <div className="prescription-footer">
              <span>Refills: {prescription.refillsRemaining || 0}</span>
              <button className="download-btn">
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};