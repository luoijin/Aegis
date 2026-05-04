// frontend/src/components/features/Admin/components/SpecializationsTab/SpecializationDetailsModal.jsx
import React from 'react';
import { X, Award, Users, Stethoscope, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';
import './SpecializationDetailsModal.css';

const SpecializationDetailsModal = ({ specialization, doctors, doctorCount, onClose }) => {
  const formatDate = (date) => new Date(date).toLocaleDateString();

  return (
    <div className="spec-details-modal-overlay" onClick={onClose}>
      <div className="spec-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Award size={20} />
            {specialization.name}
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Specialization Information */}
          <section className="details-section">
            <h4><Award size={16} /> Specialization Information</h4>
            <div className="details-table">
              <div className="details-row">
                <div className="details-label">Name</div>
                <div className="details-value">{specialization.name}</div>
              </div>
              {specialization.description && (
                <div className="details-row">
                  <div className="details-label">Description</div>
                  <div className="details-value">{specialization.description}</div>
                </div>
              )}
              <div className="details-row">
                <div className="details-label">Status</div>
                <div className="details-value">
                  <div className={`status-badge ${doctorCount > 0 ? 'active' : 'inactive'}`}>
                    <span className="status-dot"></span>
                    {doctorCount > 0 ? 'Active' : 'Inactive'}
                  </div>
                  <span className="status-note">
                    {doctorCount > 0 ? '(Has doctors assigned)' : '(No doctors assigned)'}
                  </span>
                </div>
              </div>
              <div className="details-row">
                <div className="details-label">Doctor Count</div>
                <div className="details-value">
                  <Users size={14} />
                  <strong>{doctorCount}</strong> {doctorCount === 1 ? 'doctor' : 'doctors'}
                </div>
              </div>
              {specialization.createdAt && (
                <div className="details-row">
                  <div className="details-label">Created</div>
                  <div className="details-value">
                    <Calendar size={14} />
                    {formatDate(specialization.createdAt)}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Doctors Section */}
          <section className="details-section">
            <h4><Stethoscope size={16} /> Doctors with this Specialization ({doctorCount})</h4>
            {doctorCount === 0 ? (
              <div className="empty-doctors">
                <Users size={32} />
                <p>No doctors have this specialization yet.</p>
                <span>Doctors can be assigned this specialization when creating or editing their profile.</span>
              </div>
            ) : (
              <div className="doctors-table-wrapper">
                <table className="doctors-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Email</th>
                      <th>License</th>
                      <th>Hospital</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map(doctor => (
                      <tr key={doctor._id}>
                        <td className="doctor-name-cell">
                          <div className="doctor-name">
                            Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                          </div>
                        </td>
                        <td className="doctor-email-cell">
                          <Mail size={12} /> {doctor.email}
                        </td>
                        <td>{doctor.licenseNumber || 'N/A'}</td>
                        <td>
                          {doctor.hospital?.name ? (
                            <span className="hospital-name">{doctor.hospital.name}</span>
                          ) : (
                            <span className="unassigned-badge">No hospital</span>
                          )}
                        </td>
                        <td>
                          <div className={`status-badge ${doctor.isActive ? 'active' : 'inactive'}`}>
                            <span className="status-dot"></span>
                            {doctor.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SpecializationDetailsModal;