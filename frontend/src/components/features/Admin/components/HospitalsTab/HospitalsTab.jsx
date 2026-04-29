import React from 'react';
import { Plus, Edit, Trash2, Hospital, Phone, Mail } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import './HospitalsTab.css';

const HospitalsTab = ({ hospitals, onAdd, onEdit, onDelete }) => {
  return (
    <div className="hospitals-tab">
      <div className="tab-header">
        <h3><Hospital size={18} /> Hospitals</h3>
        <Button variant="primary" size="sm" onClick={onAdd}>
          <Plus size={16} /> Add Hospital
        </Button>
      </div>
      <div className="hospitals-grid">
        {hospitals.length === 0 ? (
          <div className="empty-state">No hospitals added yet.</div>
        ) : (
          hospitals.map(hospital => (
            <div key={hospital._id} className="hospital-card">
              <div className="hospital-header">
                <h4><Hospital size={16} /> {hospital.name}</h4>
                <div className="hospital-actions">
                  <button onClick={() => onEdit(hospital)}><Edit size={16} /></button>
                  <button onClick={() => onDelete(hospital._id)}><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="hospital-details">
                <p>{hospital.address}, {hospital.city}</p>
                <p><Phone size={12} /> {hospital.phone}</p>
                <p><Mail size={12} /> {hospital.email}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HospitalsTab;