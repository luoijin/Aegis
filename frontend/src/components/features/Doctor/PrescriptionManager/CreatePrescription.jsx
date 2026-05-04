// frontend/src/components/features/Doctor/PrescriptionManager/CreatePrescription.jsx
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import '../../../../styles/doctor-modal.css';

export const CreatePrescription = ({ patients, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: '',
    refillsRemaining: ''  // Start as empty string, not 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    
    // Convert refillsRemaining to number before submitting
    const submitData = {
      ...formData,
      refillsRemaining: formData.refillsRemaining === '' ? 0 : parseInt(formData.refillsRemaining, 10)
    };
    
    await onSubmit(submitData);
    setLoading(false);
  };

  const handleRefillsChange = (e) => {
    // Allow only digits and empty string
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({ ...formData, refillsRemaining: value });
    }
  };

  return (
    <div className="doctor-modal-overlay" onClick={onClose}>
      <div className="doctor-modal-container doctor-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="doctor-modal-header">
          <h3>Create Prescription</h3>
          <button className="doctor-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="doctor-modal-form" onSubmit={handleSubmit}>
          {error && <div className="doctor-error-message">{error}</div>}

          <div className="doctor-form-group">
            <label>Select Patient <span className="doctor-required">*</span></label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              required
            >
              <option value="">Choose a patient</option>
              {patients.map(patient => {
                const name = `${patient.user?.profile?.firstName || ''} ${patient.user?.profile?.lastName || ''}`.trim();
                return (
                  <option key={patient._id} value={patient._id}>
                    {name || 'Unknown Patient'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="doctor-form-group">
            <label>Medications</label>
            <div className="doctor-medications-list">
              {formData.medications.map((med, index) => (
                <div key={index} className="doctor-medication-row">
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
                    placeholder="Twice daily"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    placeholder="7 days"
                  />
                  {formData.medications.length > 1 && (
                    <button type="button" className="doctor-remove-med-btn" onClick={() => removeMedication(index)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="doctor-add-med-btn" onClick={addMedication}>
              <Plus size={16} /> Add Medication
            </button>
          </div>

          <div className="doctor-form-group">
            <label>Refills Remaining</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={formData.refillsRemaining}
              onChange={handleRefillsChange}
              placeholder="0"
            />
          </div>

          <div className="doctor-form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
              placeholder="Special instructions for the patient..."
            />
          </div>

          <div className="doctor-modal-actions">
            <button type="button" className="doctor-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="doctor-submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};