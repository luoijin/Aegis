import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Search, Plus, Eye, TrendingUp, Clock,
  FileText, LogOut, Heart, Trash2, Calendar, Bell,
  Stethoscope, Mail, Phone, UserPlus, CheckCircle, XCircle,
  AlertCircle, Download, Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user, logout } = useAuthStore();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVitals, setShowAddVitals] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [activeTab, setActiveTab] = useState('patients');
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({ totalPatients: 0, pendingReferrals: 0, alerts: 0 });

  const [vitalsForm, setVitalsForm] = useState({
    bpSystolic: '', bpDiastolic: '', heartRate: '', temperature: '', bloodSugar: '', spO2: '', weight: '', notes: ''
  });

  const [referralForm, setReferralForm] = useState({
    toDoctorId: '', reason: '', priority: 'normal', notes: ''
  });

  useEffect(() => {
    fetchData();
    fetchDoctors();
    fetchNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, referralsRes] = await Promise.all([
        api.get('/doctor/patients'),
        api.get('/doctor/referrals/received')
      ]);
      setPatients(patientsRes.data);
      setReferrals(referralsRes.data);
      
      setStats({
        totalPatients: patientsRes.data.length,
        pendingReferrals: referralsRes.data.filter(r => r.status === 'pending').length,
        alerts: patientsRes.data.filter(p => p.hasAlert).length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/admin/doctors');
      setDoctors(res.data.filter(d => d.user?._id !== user?._id));
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const res = await api.get(`/doctor/patients/${patientId}`);
      setSelectedPatient(res.data.patient);
      setHealthLogs(res.data.healthLogs);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/doctor/notifications');
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleAddVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    try {
      await api.post(`/doctor/health-logs/${selectedPatient._id}`, vitalsForm);
      toast.success('Vitals recorded successfully');
      setShowAddVitals(false);
      setVitalsForm({ bpSystolic: '', bpDiastolic: '', heartRate: '', temperature: '', bloodSugar: '', spO2: '', weight: '', notes: '' });
      fetchPatientDetails(selectedPatient._id);
    } catch (error) {
      toast.error('Failed to record vitals');
    }
  };

  const handleRespondToReferral = async (referralId, status, responseNotes) => {
    try {
      await api.put(`/doctor/referrals/${referralId}/respond`, { status, responseNotes });
      toast.success(`Referral ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to respond to referral');
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    try {
      await api.post('/doctor/referrals', {
        patientId: selectedPatient._id,
        ...referralForm
      });
      toast.success('Referral sent successfully');
      setShowReferralModal(false);
      setReferralForm({ toDoctorId: '', reason: '', priority: 'normal', notes: '' });
    } catch (error) {
      toast.error('Failed to send referral');
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.put(`/doctor/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.user?.name?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.name?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare chart data from health logs
  const chartData = healthLogs.slice().reverse().slice(0, 30).map(log => ({
    date: format(new Date(log.timestamp), 'MM/dd'),
    heartRate: log.vitals?.heartRate || 0,
    bpSystolic: log.vitals?.bpSystolic || 0,
    bpDiastolic: log.vitals?.bpDiastolic || 0
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Stethoscope size={28} className="text-primary-600" />
            <span className="text-xl font-bold text-primary-900">Aegis Doctor Portal</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <div className="relative group">
              <Bell size={20} className="text-gray-600 cursor-pointer hover:text-primary-600" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg hidden group-hover:block z-10">
                <div className="p-3 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No notifications</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif._id} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`} onClick={() => markNotificationRead(notif._id)}>
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{format(new Date(notif.createdAt), 'MMM dd, h:mm a')}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <span className="text-gray-600">Dr. {user?.name?.firstName} {user?.name?.lastName}</span>
            <button onClick={logout} className="text-red-600 hover:text-red-700 flex items-center gap-1">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-xl"><Users size={24} className="text-blue-600" /></div><div><h3 className="text-gray-500 text-sm">Total Patients</h3><p className="text-2xl font-bold">{stats.totalPatients}</p></div></div>
          <div className="card flex items-center gap-4"><div className="bg-yellow-100 p-3 rounded-xl"><Clock size={24} className="text-yellow-600" /></div><div><h3 className="text-gray-500 text-sm">Pending Referrals</h3><p className="text-2xl font-bold">{stats.pendingReferrals}</p></div></div>
          <div className="card flex items-center gap-4"><div className="bg-red-100 p-3 rounded-xl"><AlertCircle size={24} className="text-red-600" /></div><div><h3 className="text-gray-500 text-sm">Active Alerts</h3><p className="text-2xl font-bold">{stats.alerts}</p></div></div>
          <div className="card flex items-center gap-4"><div className="bg-green-100 p-3 rounded-xl"><TrendingUp size={24} className="text-green-600" /></div><div><h3 className="text-gray-500 text-sm">Consultations</h3><p className="text-2xl font-bold">0</p></div></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button className={`px-4 py-2 font-medium ${activeTab === 'patients' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`} onClick={() => setActiveTab('patients')}>My Patients</button>
          <button className={`px-4 py-2 font-medium ${activeTab === 'referrals' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`} onClick={() => setActiveTab('referrals')}>Referrals</button>
          <button className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`} onClick={() => setActiveTab('pending')}>Pending Requests</button>
        </div>

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Patients</h2>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search patients..." className="input-field pl-10 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No patients assigned yet</div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map(patient => (
                  <div key={patient._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {patient.user?.name?.firstName?.[0]}{patient.user?.name?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold">{patient.user?.name?.firstName} {patient.user?.name?.lastName}</h4>
                        <p className="text-sm text-gray-500">{patient.user?.email}</p>
                        <p className="text-xs text-gray-400">Blood: {patient.bloodGroup || 'N/A'} | DOB: {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedPatient(patient); fetchPatientDetails(patient._id); setActiveTab('view') }} className="btn-outline text-sm py-1.5 px-3 flex items-center gap-1"><Eye size={16} /> View</button>
                      <button onClick={() => { setSelectedPatient(patient); setShowAddVitals(true); }} className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1"><Heart size={16} /> Record Vitals</button>
                      <button onClick={() => { setSelectedPatient(patient); setShowReferralModal(true); }} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"><UserPlus size={16} /> Refer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Patient View Modal */}
        {selectedPatient && activeTab === 'view' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setActiveTab('patients')}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Patient: {selectedPatient.user?.name?.firstName} {selectedPatient.user?.name?.lastName}</h2>
                <button onClick={() => setActiveTab('patients')} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              
              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div><span className="text-gray-500">Email:</span> {selectedPatient.user?.email}</div>
                <div><span className="text-gray-500">Phone:</span> {selectedPatient.user?.phone || 'N/A'}</div>
                <div><span className="text-gray-500">Blood Group:</span> {selectedPatient.bloodGroup || 'N/A'}</div>
                <div><span className="text-gray-500">Allergies:</span> {selectedPatient.allergies?.join(', ') || 'None'}</div>
                <div><span className="text-gray-500">Chronic Conditions:</span> {selectedPatient.chronicConditions?.join(', ') || 'None'}</div>
              </div>
              
              {/* Vitals Chart */}
              {chartData.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Health Trends (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="heartRate" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Health Logs Table */}
              <h3 className="font-semibold mb-3">Health Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr><th className="text-left py-2 px-3">Date</th><th>BP</th><th>Heart Rate</th><th>Temp</th><th>SpO2</th><th>Notes</th></tr></thead>
                  <tbody>
                    {healthLogs.map(log => (
                      <tr key={log._id} className="border-t"><td className="py-2 px-3">{format(new Date(log.timestamp), 'MMM dd, yyyy')}</td>
                      <td className="py-2 px-3">{log.vitals?.bpSystolic}/{log.vitals?.bpDiastolic}</td>
                      <td className="py-2 px-3">{log.vitals?.heartRate}</td>
                      <td className="py-2 px-3">{log.vitals?.temperature}</td>
                      <td className="py-2 px-3">{log.vitals?.spO2}%</td>
                      <td className="py-2 px-3">{log.notes}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Vitals Modal */}
        {showAddVitals && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddVitals(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Record Vitals for {selectedPatient.user?.name?.firstName}</h3>
              <form onSubmit={handleAddVitals} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="BP Systolic" className="input-field" value={vitalsForm.bpSystolic} onChange={(e) => setVitalsForm({...vitalsForm, bpSystolic: e.target.value})} required />
                  <input type="number" placeholder="BP Diastolic" className="input-field" value={vitalsForm.bpDiastolic} onChange={(e) => setVitalsForm({...vitalsForm, bpDiastolic: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Heart Rate" className="input-field" value={vitalsForm.heartRate} onChange={(e) => setVitalsForm({...vitalsForm, heartRate: e.target.value})} required />
                  <input type="number" step="0.1" placeholder="Temperature" className="input-field" value={vitalsForm.temperature} onChange={(e) => setVitalsForm({...vitalsForm, temperature: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Blood Sugar" className="input-field" value={vitalsForm.bloodSugar} onChange={(e) => setVitalsForm({...vitalsForm, bloodSugar: e.target.value})} />
                  <input type="number" placeholder="SpO2 %" className="input-field" value={vitalsForm.spO2} onChange={(e) => setVitalsForm({...vitalsForm, spO2: e.target.value})} />
                </div>
                <input type="number" step="0.1" placeholder="Weight (kg)" className="input-field" value={vitalsForm.weight} onChange={(e) => setVitalsForm({...vitalsForm, weight: e.target.value})} />
                <textarea placeholder="Notes" className="input-field" rows="2" value={vitalsForm.notes} onChange={(e) => setVitalsForm({...vitalsForm, notes: e.target.value})} />
                <div className="flex gap-3 mt-4"><button type="button" onClick={() => setShowAddVitals(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Save Vitals</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Referral Modal */}
        {showReferralModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReferralModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Refer Patient to Specialist</h3>
              <form onSubmit={handleCreateReferral} className="space-y-3">
                <select className="input-field" required value={referralForm.toDoctorId} onChange={(e) => setReferralForm({...referralForm, toDoctorId: e.target.value})}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.user?.name?.firstName} {d.user?.name?.lastName} - {d.specialization}</option>)}
                </select>
                <textarea placeholder="Reason for referral" className="input-field" rows="3" required value={referralForm.reason} onChange={(e) => setReferralForm({...referralForm, reason: e.target.value})} />
                <select className="input-field" value={referralForm.priority} onChange={(e) => setReferralForm({...referralForm, priority: e.target.value})}>
                  <option value="normal">Normal</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option>
                </select>
                <textarea placeholder="Additional notes" className="input-field" rows="2" value={referralForm.notes} onChange={(e) => setReferralForm({...referralForm, notes: e.target.value})} />
                <div className="flex gap-3 mt-4"><button type="button" onClick={() => setShowReferralModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Send Referral</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Received Referrals</h2>
            <div className="space-y-3">
              {referrals.map(ref => (
                <div key={ref._id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div><h4 className="font-semibold">From: Dr. {ref.fromDoctor?.user?.name?.firstName} {ref.fromDoctor?.user?.name?.lastName}</h4>
                    <p className="text-sm text-gray-600">Patient: {ref.patient?.user?.name?.firstName} {ref.patient?.user?.name?.lastName}</p>
                    <p className="text-sm text-gray-600">Reason: {ref.reason}</p>
                    <p className="text-xs text-gray-400">Priority: <span className={`px-2 py-0.5 rounded-full text-xs ${ref.priority === 'emergency' ? 'bg-red-100 text-red-700' : ref.priority === 'urgent' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{ref.priority}</span></p></div>
                    <div className="flex gap-2">{ref.status === 'pending' ? (<><button onClick={() => handleRespondToReferral(ref._id, 'accepted', '')} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"><CheckCircle size={14} /> Accept</button>
                    <button onClick={() => handleRespondToReferral(ref._id, 'denied', '')} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"><XCircle size={14} /> Decline</button></>) : (<span className={`px-3 py-1 rounded-lg text-sm ${ref.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ref.status.toUpperCase()}</span>)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;