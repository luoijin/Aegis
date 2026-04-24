import React, { useState } from 'react';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import api from '../../../utils/api';
import './HealthLogForm.css';

const HealthLogForm = ({ patientId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    vitals: {
      bloodPressure: { systolic: '', diastolic: '' },
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      bloodGlucose: ''
    },
    symptoms: [],
    notes: ''
  });
  const [symptomInput, setSymptomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVitalChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [parent]: { ...prev.vitals[parent], [child]: value }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        vitals: { ...prev.vitals, [field]: value }
      }));
    }
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const removeSymptom = (index) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/health-logs', {
        patient: patientId,
        vitals: {
          bloodPressure: {
            systolic: parseInt(formData.vitals.bloodPressure.systolic),
            diastolic: parseInt(formData.vitals.bloodPressure.diastolic)
          },
          heartRate: parseInt(formData.vitals.heartRate),
          temperature: parseFloat(formData.vitals.temperature),
          respiratoryRate: parseInt(formData.vitals.respiratoryRate),
          oxygenSaturation: parseInt(formData.vitals.oxygenSaturation),
          bloodGlucose: parseInt(formData.vitals.bloodGlucose)
        },
        symptoms: formData.symptoms,
        notes: formData.notes
      });

      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save health log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-log-form">
      <div className="form-header">
        <h3>Record Health Vitals</h3>
        <button className="close-btn" onClick={onCancel}>×</button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Vital Signs</h4>
          <div className="vitals-grid">
            <div className="vital-group">
              <label>Blood Pressure</label>
              <div className="bp-inputs">
                <input
                  type="number"
                  placeholder="Systolic"
                  value={formData.vitals.bloodPressure.systolic}
                  onChange={(e) => handleVitalChange('bloodPressure.systolic', e.target.value)}
                />
                <span>/</span>
                <input
                  type="number"
                  placeholder="Diastolic"
                  value={formData.vitals.bloodPressure.diastolic}
                  onChange={(e) => handleVitalChange('bloodPressure.diastolic', e.target.value)}
                />
              </div>
            </div>

            <Input
              label="Heart Rate (bpm)"
              type="number"
              value={formData.vitals.heartRate}
              onChange={(e) => handleVitalChange('heartRate', e.target.value)}
              placeholder="60-100"
            />

            <Input
              label="Temperature (°C)"
              type="number"
              step="0.1"
              value={formData.vitals.temperature}
              onChange={(e) => handleVitalChange('temperature', e.target.value)}
              placeholder="36.5-37.5"
            />

            <Input
              label="Respiratory Rate"
              type="number"
              value={formData.vitals.respiratoryRate}
              onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
              placeholder="12-20 breaths/min"
            />

            <Input
              label="Oxygen Saturation (%)"
              type="number"
              value={formData.vitals.oxygenSaturation}
              onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
              placeholder="95-100"
            />

            <Input
              label="Blood Glucose (mg/dL)"
              type="number"
              value={formData.vitals.bloodGlucose}
              onChange={(e) => handleVitalChange('bloodGlucose', e.target.value)}
              placeholder="70-140"
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Symptoms</h4>
          <div className="symptoms-input">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="Enter symptom (e.g., headache, fever)"
              onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
            />
            <Button type="button" onClick={addSymptom} size="sm">Add</Button>
          </div>
          <div className="symptoms-list">
            {formData.symptoms.map((symptom, index) => (
              <span key={index} className="symptom-tag">
                {symptom}
                <button type="button" onClick={() => removeSymptom(index)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h4>Additional Notes</h4>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Enter any additional notes or observations..."
            rows="4"
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Save Health Record
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HealthLogForm;