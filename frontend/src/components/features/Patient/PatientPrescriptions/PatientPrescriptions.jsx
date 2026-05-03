// frontend/src/components/features/Patient/PatientPrescriptions/PatientPrescriptions.jsx
import React from 'react';
import { FileText, Download, Calendar, Pill } from 'lucide-react';
import { generatePrescriptionPDF } from '../../../../utils/pdfGenerator'; // Make sure this path is correct
import './PatientPrescriptions.css';

export const PatientPrescriptions = ({ prescriptions }) => {
  const handleDownloadPDF = async (prescription) => {
    try {
      // Call your existing pdfGenerator
      await generatePrescriptionPDF(prescription);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="prescriptions-card">
        <div className="card-header">
          <h3><FileText size={16} /> Prescriptions</h3>
        </div>
        <div className="empty-state">
          <FileText size={48} />
          <p>No prescriptions available</p>
          <span>Your prescriptions will appear here</span>
        </div>
      </div>
    );
  }

  return (
    <div className="prescriptions-card">
      <div className="card-header">
        <h3><FileText size={16} /> Prescriptions</h3>
      </div>
      
      <div className="prescriptions-list">
        {prescriptions.map(prescription => (
          <div key={prescription._id} className="prescription-item">
            <div className="prescription-header">
              <div className="prescription-icon">
                <Pill size={20} />
              </div>
              <div>
                <div className="prescription-date">
                  <Calendar size={12} />
                  {new Date(prescription.issuedDate).toLocaleDateString()}
                </div>
              </div>
              
            </div>
            
            <div className="prescription-medications">
              {prescription.medications?.map((med, idx) => (
                <div key={idx} className="medication-line">
                  <strong>{med.name}</strong>
                  <span>{med.dosage}</span>
                  <span>{med.frequency}</span>
                  {med.duration && <span>{med.duration}</span>}
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

              <button 
                className="download-btn"
                onClick={() => handleDownloadPDF(prescription)}
                title="Download PDF"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};