# Medical Records Integration Guide

## Overview
The Clinerva system now includes comprehensive medical records management. Users can view their health profile, medical records, lab results, medications, and clinical notes in one unified dashboard.

## New API Endpoints

### 1. Get Medical Records for Current User
**Endpoint:** `GET /api/patients/medical-records/me`
**Authentication:** Required (Bearer token)
**Description:** Fetches all medical records for the logged-in patient

**Request:**
```bash
curl -X GET http://localhost:5000/api/patients/medical-records/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "records": {
    "_id": "ObjectId",
    "patientId": "ObjectId",
    "records": [
      {
        "type": "Lab Report",
        "fileUrl": "https://...",
        "fileName": "blood_test_2024.pdf",
        "fileSize": 2048,
        "uploadedAt": "2024-03-05T10:30:00Z",
        "recordDate": "2024-03-01T00:00:00Z",
        "description": "Comprehensive blood panel",
        "documentId": "doc_123"
      }
    ],
    "clinicalNotes": [
      {
        "note": "Patient is responding well to treatment...",
        "writerName": "Dr. Smith",
        "writerId": "ObjectId",
        "createdAt": "2024-03-05T10:30:00Z"
      }
    ]
  }
}
```

---

### 2. Get Medical Records for Specific Patient (Doctor/Admin)
**Endpoint:** `GET /api/patients/:patientId/medical-records`
**Authentication:** Required (Bearer token)
**Authorization:** Doctor, Admin, or Researcher
**Parameters:**
- `patientId` (path): MongoDB ObjectId of the patient

**Request:**
```bash
curl -X GET http://localhost:5000/api/patients/507f1f77bcf86cd799439011/medical-records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Add Medical Record
**Endpoint:** `POST /api/patients/:patientId/medical-records`
**Authentication:** Required
**Method:** POST
**Body Parameters:**
- `type` (string): One of: "Lab Report", "Prescription", "Diagnosis", "Imaging", "Procedure Report", "Other"
- `fileUrl` (string, optional): URL to uploaded file
- `fileName` (string, optional): Name of the file
- `fileSize` (number, optional): Size in bytes
- `recordDate` (date, optional): Date of the record
- `description` (string, optional): Description of the record

**Request:**
```bash
curl -X POST http://localhost:5000/api/patients/507f1f77bcf86cd799439011/medical-records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Lab Report",
    "fileUrl": "https://storage.example.com/labs/blood_test.pdf",
    "fileName": "blood_test_march2024.pdf",
    "fileSize": 2048,
    "recordDate": "2024-03-01",
    "description": "Complete blood count and metabolic panel"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Medical record added successfully",
  "record": { ... }
}
```

---

### 4. Add Clinical Note
**Endpoint:** `POST /api/patients/:patientId/clinical-notes`
**Authentication:** Required
**Authorization:** Doctor, Specialist, ADMIN
**Body Parameters:**
- `note` (string, required): Clinical note content

**Request:**
```bash
curl -X POST http://localhost:5000/api/patients/507f1f77bcf86cd799439011/clinical-notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Patient is showing significant improvement in diabetes management. HbA1c reduced from 8.1 to 7.8. Continue current medication regimen."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Clinical note added successfully",
  "record": { ... }
}
```

---

## Frontend Components

### HealthProfile Component
**Location:** `frontend/src/components/HealthProfile.jsx`
**Props:**
- `patient` (object): Patient medical data
  - `age` (number)
  - `gender` (string)
  - `diagnosis` (string)
  - `medications` (array)
  - `labResults` (object)
  - `smokingStatus` (string)
  - `surgicalHistory` (string)
  - `location` (string)
- `isLoading` (boolean): Show loading state

**Usage:**
```jsx
import HealthProfile from '../components/HealthProfile';

<HealthProfile 
  patient={medicalData} 
  isLoading={isLoading} 
/>
```

**Displays:**
- 📊 Patient Overview Cards (Age, Gender, Diagnosis, Medications, Smoking Status)
- 🧪 Lab Results (HbA1c, eGFR, etc.)
- 💊 Current Medications List
- 📝 Medical Records Files (Lab Reports, Prescriptions, Imaging, etc.)
- 📋 Clinical Notes from Doctors
- 📍 Additional Health Information

---

## Database Models

### Patient Model
```javascript
{
  userId: ObjectId,
  anonymousId: String,
  age: Number,
  gender: String,
  location: String,
  diagnosis: String,
  medications: [String],
  labResults: Map<String, Mixed>,
  smokingStatus: String,
  surgicalHistory: String,
  consentGiven: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### MedicalRecord Model
```javascript
{
  patientId: ObjectId,
  records: [{
    type: String,  // "Lab Report", "Prescription", etc.
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    uploadedAt: Date,
    recordDate: Date,
    description: String,
    documentId: String
  }],
  clinicalNotes: [{
    note: String,
    writerName: String,
    writerId: ObjectId,
    createdAt: Date
  }],
  uploadedBy: ObjectId,
  lastModifiedBy: ObjectId,
  isEncrypted: Boolean,
  accessLogs: [{
    accessedBy: ObjectId,
    accessedAt: Date,
    accessReason: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Backend Services

### PatientService Methods

#### `getMedicalRecordsByUserId(userId)`
Get medical records for a patient by their user ID
```javascript
const records = await PatientService.getMedicalRecordsByUserId(userId);
```

#### `getMedicalRecords(patientId)`
Get medical records for a patient by patient ID
```javascript
const records = await PatientService.getMedicalRecords(patientId);
```

#### `addMedicalRecord(patientId, recordData)`
Add a new medical record
```javascript
const newRecord = await PatientService.addMedicalRecord(
  patientId, 
  {
    type: 'Lab Report',
    fileUrl: 'https://...',
    fileName: 'test.pdf',
    description: 'Lab results'
  }
);
```

#### `addClinicalNote(patientId, userId, note)`
Add a clinical note
```javascript
const updated = await PatientService.addClinicalNote(
  patientId,
  userId,
  'Patient note content...'
);
```

---

## Frontend Integration

The PatientDashboard now includes a "My Health Profile" tab that displays:

1. **Patient Health Cards** - Age, Gender, Diagnosis, Medications, Smoking Status
2. **Lab Results** - HbA1c, eGFR, and other lab values
3. **Current Medications** - List of active medications
4. **Medical Records** - Uploaded files and documents
5. **Clinical Notes** - Notes from healthcare providers
6. **Health Information Summary** - Location, surgical history, profile creation date

### Access Flow
1. User logs in
2. Navigates to "My Health Profile" tab
3. HealthProfile component fetches medical records from `/api/patients/medical-records/me`
4. Displays fetched data in organized cards and sections

---

## Error Handling

The system handles the following scenarios:
- **No patient profile**: Returns `patient: null`
- **No medical records**: Shows empty state with message
- **API failure**: Displays error message with "Try Again" button
- **Network issues**: Graceful fallback to retry mechanism

---

## Security Features

✅ **Authentication Required** - All endpoints require valid JWT token
✅ **Role-Based Access** - Doctors and admins can view patient records
✅ **User Isolation** - Patients only see their own records via `/me` endpoint
✅ **Encryption** - Medical records marked as encrypted in database
✅ **Access Logging** - Track who accessed which records
✅ **Anonymous ID** - Patient anonymization for research data

---

## Testing the Integration

### 1. Test Medical Records Endpoint
```bash
# Get your medical records
curl -X GET http://localhost:5000/api/patients/medical-records/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test Adding Medical Record
```bash
curl -X POST http://localhost:5000/api/patients/YOUR_PATIENT_ID/medical-records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Lab Report",
    "description": "Blood test results",
    "recordDate": "2024-03-01"
  }'
```

### 3. Test in Frontend
1. Open http://localhost:5173
2. Login as a patient
3. Click on "My Health Profile" tab
4. View all medical information and records

---

## Future Enhancements

📋 Document Upload - Allow patients to upload files
🔍 Search Medical Records - Filter by date, type, keyword
📤 Export Records - Download records as PDF/ZIP
🔐 Enhanced Encryption - End-to-end encryption for sensitive data
📊 Health Timeline - Visual timeline of medical events
🤖 AI Insights - AI-powered health insights and recommendations
