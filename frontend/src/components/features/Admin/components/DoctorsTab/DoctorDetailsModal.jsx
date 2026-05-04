// frontend/src/components/features/Admin/components/DoctorsTab/DoctorDetailsModal.jsx
import React from 'react';
import { X, User, Mail, Phone, Award, Building, Stethoscope, Users, Calendar, MapPin, CheckCircle } from 'lucide-react';
import './DoctorDetailsModal.css';

const DoctorDetailsModal = ({ doctor, patients, onClose }) => {
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  return (
    <div className="doctor-modal-overlay" onClick={onClose}>
      <div className="doctor-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Stethoscope size={20} />
            Doctor Details – Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Personal Information - Table Style */}
          <section className="details-section">
            <h4><User size={16} /> Personal Information</h4>
            <div className="details-table">
              <div className="details-row">
                <div className="details-label">Full Name</div>
                <div className="details-value">Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}</div>
              </div>
              <div className="details-row">
                <div className="details-label">Date of Birth</div>
                <div className="details-value">{doctor.profile?.dateOfBirth ? formatDate(doctor.profile.dateOfBirth) : 'N/A'}</div>
              </div>
              <div className="details-row">
                <div className="details-label">Age</div>
                <div className="details-value">{calculateAge(doctor.profile?.dateOfBirth)} years</div>
              </div>
              <div className="details-row">
                <div className="details-label">Gender</div>
                <div className="details-value">{doctor.profile?.gender || 'Not specified'}</div>
              </div>
              <div className="details-row">
                <div className="details-label">Email</div>
                <div className="details-value"><Mail size={12} /> {doctor.email}</div>
              </div>
              <div className="details-row">
                <div className="details-label">Phone</div>
                <div className="details-value"><Phone size={12} /> {doctor.profile?.phone || 'Not provided'}</div>
              </div>
            </div>
          </section>

          {/* Professional Information - Table Style */}
          <section className="details-section">
            <h4><Award size={16} /> Professional Information</h4>
            <div className="details-table">
              <div className="details-row">
                <div className="details-label">Specialization</div>
                <div className="details-value">{doctor.specialization || 'General'}</div>
              </div>
              <div className="details-row">
                <div className="details-label">License Number</div>
                <div className="details-value">{doctor.licenseNumber || 'N/A'}</div>
              </div>
              <div className="details-row">
                <div className="details-label">Status</div>
                <div className="details-value">
                  <span className={`status-badge ${doctor.isActive ? 'active' : 'inactive'}`}>
                    <span className="status-dot"></span>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Hospital Information - Table Style */}
          <section className="details-section">
            <h4><Building size={16} /> Hospital Affiliation</h4>
            <div className="details-table">
              <div className="details-row">
                <div className="details-label">Hospital Name</div>
                <div className="details-value">
                  {doctor.hospital?.name ? (
                    <><Building size={12} /> {doctor.hospital.name}</>
                  ) : (
                    'Not assigned to any hospital'
                  )}
                </div>
              </div>
              {doctor.hospital?.address && (
                <div className="details-row">
                  <div className="details-label">Address</div>
                  <div className="details-value">
                    <MapPin size={12} /> 
                    {doctor.hospital.address.street && `${doctor.hospital.address.street}, `}
                    {doctor.hospital.address.city && `${doctor.hospital.address.city}, `}
                    {doctor.hospital.address.state || ''}
                  </div>
                </div>
              )}
              {doctor.hospital?.phone && (
                <div className="details-row">
                  <div className="details-label">Hospital Phone</div>
                  <div className="details-value"><Phone size={12} /> {doctor.hospital.phone}</div>
                </div>
              )}
            </div>
          </section>

          {/* Assigned Patients - Table Style */}
          <section className="details-section">
            <h4><Users size={16} /> Assigned Patients ({patients.length})</h4>
            {patients.length === 0 ? (
              <div className="empty-message">No patients assigned to this doctor yet.</div>
            ) : (
              <div className="patients-table-wrapper">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Blood Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(patient => (
                      <tr key={patient._id}>
                        <td className="patient-name-cell">
                          <div className="patient-name">
                            {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                          </div>
                          <div className="patient-dob">
                            <Calendar size={10} /> {patient.user?.profile?.dateOfBirth ? formatDate(patient.user.profile.dateOfBirth) : 'N/A'}
                          </div>
                        </td>
                        <td><Mail size={12} /> {patient.user?.email}</td>
                        <td><Phone size={12} /> {patient.user?.profile?.phone || 'N/A'}</td>
                        <td>{patient.bloodType || 'N/A'}</td>
                        <td>
                          <div className={`status-badge ${patient.user?.isActive ? 'active' : 'inactive'}`}>
                            <span className="status-dot"></span>
                            {patient.user?.isActive ? 'Active' : 'Inactive'}
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

export default DoctorDetailsModal;