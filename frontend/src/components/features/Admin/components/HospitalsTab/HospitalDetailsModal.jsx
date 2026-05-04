// frontend/src/components/features/Admin/components/HospitalsTab/HospitalDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Building, Phone, Mail, MapPin, Users, Stethoscope } from 'lucide-react';
import api from '../../../../../utils/api';
import './HospitalDetailsModal.css';

const HospitalDetailsModal = ({ hospital, onClose, onRefresh }) => {
  const [hospitalData, setHospitalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hospital?._id) {
      fetchHospitalDetails();
    }
  }, [hospital]);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/hospitals/${hospital._id}/doctors`);
      setHospitalData(response.data);
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      setHospitalData(hospital);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = () => {
    if (!hospitalData?.address) return 'Address not specified';
    
    const parts = [
      hospitalData.address.street,
      hospitalData.address.city,
      hospitalData.address.province,
      hospitalData.address.zipCode
    ].filter(p => p);
    
    return parts.join(', ') || 'Address not specified';
  };

  return (
    <div className="hospital-modal-overlay" onClick={onClose}>
      <div className="hospital-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Building size={20} />
            {hospitalData?.name || hospital.name}
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Hospital Information */}
          <section className="details-section">
            <h4><Building size={16} /> Hospital Information</h4>
            <div className="details-table">
              <div className="details-row">
                <div className="details-label">Name</div>
                <div className="details-value">{hospitalData?.name || hospital.name}</div>
              </div>
              <div className="details-row">
                <div className="details-label">Address</div>
                <div className="details-value"><MapPin size={12} /> {formatAddress()}</div>
              </div>
              {hospitalData?.phone && (
                <div className="details-row">
                  <div className="details-label">Phone</div>
                  <div className="details-value"><Phone size={12} /> {hospitalData.phone}</div>
                </div>
              )}
              {hospitalData?.email && (
                <div className="details-row">
                  <div className="details-label">Email</div>
                  <div className="details-value"><Mail size={12} /> {hospitalData.email}</div>
                </div>
              )}
              <div className="details-row">
                <div className="details-label">Country</div>
                <div className="details-value">Philippines</div>
              </div>
            </div>
          </section>

          {/* Doctors Section */}
          <section className="details-section">
            <h4><Users size={16} /> Doctors ({hospitalData?.doctorCount || 0})</h4>
            {loading ? (
              <div className="loading-doctors">Loading doctors...</div>
            ) : (!hospitalData?.doctors || hospitalData.doctors.length === 0) ? (
              <div className="empty-doctors">
                <Stethoscope size={32} />
                <p>No doctors assigned to this hospital yet.</p>
                <span>Doctors can be assigned when editing their profile.</span>
              </div>
            ) : (
              <div className="doctors-table-wrapper">
                <table className="doctors-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Specialization</th>
                      <th>License</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitalData.doctors.map(doctor => (
                      <tr key={doctor._id}>
                        <td className="doctor-name-cell">
                          <div className="doctor-name">
                            Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                          </div>
                          <div className="doctor-email">{doctor.email}</div>
                        </td>
                        <td>
                          <span className="specialty-badge">
                            {doctor.specialization || 'General'}
                          </span>
                        </td>
                        <td>{doctor.licenseNumber || 'N/A'}</td>
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

export default HospitalDetailsModal;