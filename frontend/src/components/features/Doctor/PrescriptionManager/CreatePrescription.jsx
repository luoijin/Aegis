// frontend/src/components/features/Doctor/PrescriptionManager/CreatePrescription.jsx
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import './CreatePrescription.css';

export const CreatePrescription = ({ patients, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: '',
    refillsRemaining: 0
  });
  const [loading, setLoading] = useState(false);

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index) => {
    const medications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications });
  };

  const updateMedication = (index, field, value) => {
    const medications = [...formData.medications];
    medications[index][field] = value;
    setFormData({ ...formData, medications });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-prescription-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Prescription</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Patient *</label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              required
            >
              <option value="">Choose a patient</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Medications</label>
            {formData.medications.map((med, index) => (
              <div key={index} className="medication-row">
                <input
                  type="text"
                  placeholder="Medication name"
                  value={med.name}
                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  placeholder="e.g., 500mg"
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  value={med.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  placeholder="e.g., Twice daily"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={med.duration}
                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  placeholder="e.g., 7 days"
                />
                {formData.medications.length > 1 && (
                  <button type="button" className="remove-med-btn" onClick={() => removeMedication(index)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-med-btn" onClick={addMedication}>
              <Plus size={16} /> Add Medication
            </button>
          </div>

          <div className="form-group">
            <label>Refills Remaining</label>
            <input
              type="number"
              value={formData.refillsRemaining}
              onChange={(e) => setFormData({...formData, refillsRemaining: parseInt(e.target.value)})}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
              placeholder="Special instructions for the patient..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};