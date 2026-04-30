import React from 'react';
import './VitalsForm.css';

export const VitalsForm = ({ vitals, setVitals, onSubmit, loading, onCancel }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="vitals-form-row">
        <div className="form-group">
          <label>Heart Rate (bpm)</label>
          <input 
            type="number" 
            placeholder="60-100" 
            value={vitals.heartRate} 
            onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Systolic BP</label>
          <input 
            type="number" 
            placeholder="120" 
            value={vitals.systolicBP} 
            onChange={(e) => setVitals({...vitals, systolicBP: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Diastolic BP</label>
          <input 
            type="number" 
            placeholder="80" 
            value={vitals.diastolicBP} 
            onChange={(e) => setVitals({...vitals, diastolicBP: e.target.value})} 
            required 
          />
        </div>
      </div>
      
      <div className="vitals-form-row">
        <div className="form-group">
          <label>Temperature (°C)</label>
          <input 
            type="number" 
            step="0.1" 
            placeholder="36.5" 
            value={vitals.temperature} 
            onChange={(e) => setVitals({...vitals, temperature: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <label>O2 Saturation (%)</label>
          <input 
            type="number" 
            placeholder="95-100" 
            value={vitals.oxygenSaturation} 
            onChange={(e) => setVitals({...vitals, oxygenSaturation: e.target.value})} 
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Notes</label>
        <textarea 
          placeholder="Additional notes..." 
          value={vitals.notes} 
          onChange={(e) => setVitals({...vitals, notes: e.target.value})} 
          rows="3" 
        />
      </div>
      
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Vitals'}
        </button>
      </div>
    </form>
  );
};