import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  Heart,
  Pill,
  Droplets,
  Wind,
  Stethoscope,
  CheckCircle2,
  X
} from 'lucide-react';
import axios from 'axios';

export default function HealthProfile({ patient = {}, isLoading = false }) {
  const [medicalRecords, setMedicalRecords] = useState(null);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNote, setExpandedNote] = useState(null);

  // Safely normalize patient data
  const normalizePatient = (data) => {
    if (!data) return {};
    return {
      age: data.age || 'N/A',
      gender: data.gender || 'Not specified',
      diagnosis: data.diagnosis || 'Not specified',
      location: data.location || 'Not specified',
      smokingStatus: data.smokingStatus || 'Not specified',
      surgicalHistory: data.surgicalHistory || 'None',
      timestamp: data.timestamp || data.createdAt || null,
      labResults: data.labResults && typeof data.labResults === 'object' ? data.labResults : {},
      medications: Array.isArray(data.medications) 
        ? data.medications 
        : (typeof data.medications === 'string' && data.medications 
            ? data.medications.split(',').map(m => m.trim()).filter(Boolean)
            : [])
    };
  };

  const normalizedPatient = normalizePatient(patient);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setRecordsLoading(true);
      const token = localStorage.getItem('clinerva_token');
      if (!token) {
        setError('No authentication token found');
        setMedicalRecords(null);
        return;
      }

      const { data } = await axios.get(
        'http://localhost:5000/api/patients/medical-records/me',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMedicalRecords(data.records || data);
      setError(null);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError('Failed to load medical records');
      setMedicalRecords(null);
    } finally {
      setRecordsLoading(false);
    }
  };

  if (isLoading || recordsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={fetchMedicalRecords}
            className="text-red-600 hover:text-red-700 text-sm mt-2 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Age Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Age</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{normalizedPatient.age}</p>
              <p className="text-xs text-slate-500 mt-1">{normalizedPatient.gender}</p>
            </div>
            <User className="w-6 h-6 text-blue-500 opacity-30" />
          </div>
        </div>

        {/* Diagnosis Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Primary Diagnosis</p>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">{normalizedPatient.diagnosis}</p>
              <p className="text-xs text-slate-500 mt-1">
                {normalizedPatient.timestamp 
                  ? new Date(normalizedPatient.timestamp).toLocaleDateString() 
                  : 'N/A'}
              </p>
            </div>
            <Stethoscope className="w-6 h-6 text-red-500 opacity-30" />
          </div>
        </div>

        {/* Medications Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Medications</p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {normalizedPatient.medications.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Active prescriptions</p>
            </div>
            <Pill className="w-6 h-6 text-green-500 opacity-30" />
          </div>
        </div>

        {/* Smoking Status Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Smoking Status</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{normalizedPatient.smokingStatus}</p>
              <p className="text-xs text-slate-500 mt-1">
                <CheckCircle2 className="w-3 h-3 inline text-green-600 mr-1" />
                Low risk
              </p>
            </div>
            <Wind className="w-6 h-6 text-amber-500 opacity-30" />
          </div>
        </div>
      </div>

      {/* Lab Results Section */}
      {Object.keys(normalizedPatient.labResults).length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Droplets className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-semibold text-slate-900">Lab Results</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(normalizedPatient.labResults).map(([key, value]) => (
              <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">{key}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications Section */}
      {normalizedPatient.medications.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Pill className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-semibold text-slate-900">Current Medications</h3>
          </div>
          <div className="space-y-2">
            {normalizedPatient.medications.map((med, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-2 h-2 bg-brand-600 rounded-full"></div>
                <span className="text-sm text-slate-700">{med}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Records Files */}
      {medicalRecords?.records && Array.isArray(medicalRecords.records) && medicalRecords.records.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-semibold text-slate-900">Medical Records ({medicalRecords.records.length})</h3>
          </div>
          <div className="space-y-3">
            {medicalRecords.records.map((record, idx) => (
              <div key={idx} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {record.type || 'Other'}
                    </span>
                    {record.fileName && (
                      <span className="text-sm font-medium text-slate-900 truncate">{record.fileName}</span>
                    )}
                  </div>
                  {record.description && (
                    <p className="text-sm text-slate-600 mt-1">{record.description}</p>
                  )}
                  <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(record.recordDate || record.uploadedAt).toLocaleDateString()}</span>
                    </span>
                    {record.fileSize && (
                      <span>{(record.fileSize / 1024).toFixed(2)} KB</span>
                    )}
                  </div>
                </div>
                {record.fileUrl && (
                  <button className="ml-4 p-2 text-slate-400 hover:text-brand-600 rounded hover:bg-white transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Notes */}
      {medicalRecords?.clinicalNotes && Array.isArray(medicalRecords.clinicalNotes) && medicalRecords.clinicalNotes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Stethoscope className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-semibold text-slate-900">Clinical Notes ({medicalRecords.clinicalNotes.length})</h3>
          </div>
          <div className="space-y-3">
            {medicalRecords.clinicalNotes.map((note, idx) => (
              <div key={idx} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-slate-900">{note.writerName}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!medicalRecords?.records || medicalRecords.records.length === 0) &&
        (!medicalRecords?.clinicalNotes || medicalRecords.clinicalNotes.length === 0) && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-12 text-center">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium mb-1">No Medical Records Yet</p>
          <p className="text-slate-500 text-sm">Medical records and clinical notes will appear here when uploaded</p>
        </div>
      )}

      {/* Additional Health Info */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Health Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</p>
              <p className="text-sm text-slate-900 mt-1">{normalizedPatient.location}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gender</p>
              <p className="text-sm text-slate-900 mt-1">{normalizedPatient.gender}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Surgical History</p>
              <p className="text-sm text-slate-900 mt-1">{normalizedPatient.surgicalHistory}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profile Created</p>
              <p className="text-sm text-slate-900 mt-1">
                {normalizedPatient.timestamp 
                  ? new Date(normalizedPatient.timestamp).toLocaleDateString() 
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
