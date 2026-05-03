  import React, { useState } from 'react';
  import { FileText, Send, Download, Eye, X, Calendar, User, Stethoscope } from 'lucide-react';
  import './PrescriptionCard.css';

  export const PrescriptionCard = ({ prescription, onSend, onDownload }) => {
    const [showDetails, setShowDetails] = useState(false);

    const patientName = `${prescription.patient?.user?.profile?.firstName || ''} ${prescription.patient?.user?.profile?.lastName || ''}`.trim();
    const doctorName = `Dr. ${prescription.doctor?.profile?.firstName || ''} ${prescription.doctor?.profile?.lastName || ''}`.trim();

    const DetailsModal = () => {
      if (!showDetails) return null;

      return (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FileText size={20} />
                <h3>Prescription Details</h3>
              </div>
              <button className="close-btn" onClick={() => setShowDetails(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-row">
                  <span className="detail-label">Patient:</span>
                  <span className="detail-value">{patientName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Doctor:</span>
                  <span className="detail-value">{doctorName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Issued Date:</span>
                  <span className="detail-value">{new Date(prescription.issuedDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${prescription.isActive ? 'active' : 'expired'}`}>
                    {prescription.isActive ? 'Active' : 'Expired'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Refills:</span>
                  <span className="detail-value">{prescription.refillsRemaining || 0}</span>
                </div>
              </div>

              <div className="medications-section">
                <label>Medications</label>
                <div className="medications-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.medications?.map((med, idx) => (
                        <tr key={idx}>
                          <td>{med.name}</td>
                          <td>{med.dosage || '-'}</td>
                          <td>{med.frequency || '-'}</td>
                          <td>{med.duration || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {prescription.notes && (
                <div className="notes-section">
                  <label>Notes</label>
                  <p>{prescription.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="download-btn" onClick={() => { onDownload(); setShowDetails(false); }}>
                <Download size={16} /> Download PDF
              </button>
              <button className="send-btn" onClick={() => { onSend(); setShowDetails(false); }}>
                <Send size={16} /> Send to Patient
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <>
        <div className="prescription-card">
          <div className="card-header">
            <div className="patient-info">
              <div className="patient-icon">
                <User size={16} />
              </div>
              <span className="patient-name">{patientName || 'Unknown Patient'}</span>
              <span className={`status-badge ${prescription.isActive ? 'active' : 'expired'}`}>
                {prescription.isActive ? 'Active' : 'Expired'}
              </span>
            </div>
            <div className="card-actions">
              <button className="action-btn" onClick={() => setShowDetails(true)} title="View Details">
                <Eye size={16} />
              </button>
              <button className="action-btn" onClick={onDownload} title="Download PDF">
                <Download size={16} />
              </button>
              <button className="action-btn send" onClick={onSend} title="Send to Patient">
                <Send size={16} />
              </button>
            </div>
          </div>

          <div className="card-body">
            <div className="medications-preview">
              {prescription.medications?.slice(0, 2).map((med, idx) => (
                <div key={idx} className="medication-preview">
                  <span className="med-name">{med.name}</span>
                  <span className="med-dosage">{med.dosage}</span>
                </div>
              ))}
              {prescription.medications?.length > 2 && (
                <div className="more-meds">+{prescription.medications.length - 2} more</div>
              )}
            </div>
            <div className="card-footer">
              <span className="date">{new Date(prescription.issuedDate).toLocaleDateString()}</span>
              <span className="refills">Refills: {prescription.refillsRemaining || 0}</span>
            </div>
          </div>
        </div>

        <DetailsModal />
      </>
    );
  };