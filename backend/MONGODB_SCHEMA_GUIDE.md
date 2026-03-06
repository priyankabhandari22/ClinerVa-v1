# 🏥 Clinerva - AI Clinical Trial Matching Engine

## MongoDB Schema Implementation Guide

This is a complete production-style MongoDB implementation for an AI-powered clinical trial matching system supporting patients, doctors, research labs, trial matching, applications, commissions, and rewards.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Collections & Models](#collections--models)
3. [API Endpoints](#api-endpoints)
4. [Setup Instructions](#setup-instructions)
5. [Usage Examples](#usage-examples)
6. [Database Indexes](#database-indexes)

---

## 🏗️ Architecture Overview

### Core Components

```
┌─────────────────────────────────────────────────┐
│         User Authentication (Users)             │
└──────────────┬──────────────────────────────────┘
               │
      ┌────────┴─────────┬─────────────┐
      │                  │             │
   PATIENT            DOCTOR      RESEARCHER
      │                  │             │
      ├─→ Patient        ├─→ Doctor    └─→ ResearchLab
      │    Profile       │    Profile       │
      │                  │                  ├─→ ClinicalTrial
      │                  │                  ├─→ TrialCriteria
      └─→ TrialMatch ←───┴─────────────────┘
           │
      ┌────┴────┬──────────────┐
      │          │              │
   Application Commission   PatientReward
```

### Data Flow

1. **Patients create profiles** with health data (anonymized)
2. **AI Matching Engine** compares patient data against trial criteria
3. **Trial Matches** are generated with eligibility scores
4. **Patient applies** to matching trials via Application
5. **Doctor verifies** application and provides recommendation
6. **Trial sponsors** approve and issue commissions + rewards
7. **Feedback** is collected for continuous improvement

---

## 📚 Collections & Models

### 1. Users `users`
**Purpose**: Authentication and role management

```javascript
{
  _id: ObjectId,
  email: String (unique),
  passwordHash: String,
  role: 'PATIENT' | 'DOCTOR' | 'RESEARCHER' | 'ADMIN',
  isVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Patients `patients`
**Purpose**: Patient health profile (anonymized)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  anonymousId: String (unique),
  doctorId: ObjectId (ref: Doctor, optional),
  
  // Demographics
  age: Number,
  gender: 'Male' | 'Female' | 'Other',
  location: {
    city: String,
    state: String,
    coordinates: GeoJSON Point
  },
  
  // Medical Data
  conditions: [String],
  medications: [String],
  allergies: [String],
  labResults: Map<String, Mixed>,
  lifestyle: {
    smoking: Boolean,
    alcohol: Boolean
  },
  
  consentGiven: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: 
- `location.coordinates` (2dsphere)
- `conditions`
- `age`

### 3. Doctors `doctors`
**Purpose**: Healthcare provider profiles

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  name: String,
  hospital: String,
  specialization: String,
  licenseNumber: String,
  location: GeoJSON,
  patientsRegistered: Number,
  trialsReferred: Number,
  totalCommissionEarned: Number,
  rating: Number (0-5),
  isVerified: Boolean,
  createdAt: Date
}
```

### 4. Research Labs `research_labs`
**Purpose**: Trial sponsor organizations

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  labName: String,
  organizationType: 'Pharmaceutical' | 'Healthcare' | 'Academic' | 'Government',
  contactEmail: String,
  location: GeoJSON,
  website: String,
  trialsCreated: Number,
  totalParticipants: Number,
  isVerified: Boolean,
  createdAt: Date
}
```

### 5. Clinical Trials `clinical_trials`
**Purpose**: Trial information and metadata

```javascript
{
  _id: ObjectId,
  researchLabId: ObjectId (ref: ResearchLab),
  title: String,
  description: String,
  status: 'OPEN' | 'RECRUITING' | 'ACTIVE' | 'CLOSED' | 'COMPLETED',
  trialPhase: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4',
  locations: [
    {
      city: String,
      hospital: String,
      coordinates: GeoJSON
    }
  ],
  participantLimit: Number,
  currentParticipants: Number,
  startDate: Date,
  endDate: Date,
  rewardAmount: Number,
  doctorCommission: Number,
  eligibilitySummary: String,
  contactName: String,
  contactEmail: String,
  createdAt: Date
}
```

**Indexes**:
- `status`
- `trialPhase`
- `researchLabId`
- `locations.coordinates` (2dsphere)

### 6. Trial Criteria `trial_criteria_structured`
**Purpose**: AI-parsed eligibility rules

```javascript
{
  _id: ObjectId,
  trialId: ObjectId (ref: ClinicalTrial, unique),
  
  inclusionCriteria: [
    {
      field: String,
      operator: 'between' | 'equals' | '>' | '<' | '>=', | '<=' | 'contains' | 'in',
      value: Mixed,
      unit: String,
      description: String
    }
  ],
  
  exclusionCriteria: [ /* same structure */ ],
  
  primaryOutcomes: [String],
  secondaryOutcomes: [String],
  aiExtractedAt: Date,
  manuallyVerified: Boolean,
  verifiedBy: ObjectId (ref: User),
  createdAt: Date
}
```

### 7. Trial Matches `trial_matches`
**Purpose**: AI matching results

```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: Patient),
  trialId: ObjectId (ref: ClinicalTrial),
  
  eligibilityScore: Number (0-1),
  matchReasons: [String],
  exclusionReasons: [String],
  confidence: Number (0-1),
  distanceKm: Number,
  locationScore: Number,
  priorityScore: Number, // Combined score
  
  algorithmVersion: String,
  status: 'PENDING' | 'VIEWED' | 'APPLIED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED',
  viewedAt: Date,
  expiresAt: Date,
  matchedAt: Date
}
```

**Indexes**:
- `patientId`, `eligibilityScore` (compound)
- `trialId`
- `status`

### 8. Trial Applications `trial_applications`
**Purpose**: Patient applications to trials

```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: Patient),
  trialId: ObjectId (ref: ClinicalTrial),
  doctorId: ObjectId (ref: Doctor, optional),
  
  applicationStatus: 'PENDING' | 'DOCTOR_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN',
  doctorVerified: Boolean,
  eligibilityScore: Number,
  reasonForRejection: String,
  
  appliedAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId,
  enrollmentDate: Date,
  withdrawalDate: Date,
  withdrawalReason: String,
  
  createdAt: Date
}
```

**Indexes**:
- `patientId`
- `trialId`
- `applicationStatus`
- `doctorId`

### 9. Commissions `commissions`
**Purpose**: Track doctor earnings

```javascript
{
  _id: ObjectId,
  doctorId: ObjectId (ref: Doctor),
  patientId: ObjectId (ref: Patient),
  trialId: ObjectId (ref: ClinicalTrial),
  trialApplicationId: ObjectId (ref: TrialApplication),
  
  amount: Number,
  currency: String,
  percentage: Number,
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'CANCELLED',
  reason: String,
  
  paidAt: Date,
  paidBy: ObjectId,
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  
  createdAt: Date
}
```

**Indexes**:
- `doctorId`, `status` (compound)
- `trialId`

### 10. Patient Rewards `patient_rewards`
**Purpose**: Track participant incentives

```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: Patient),
  trialId: ObjectId (ref: ClinicalTrial),
  trialApplicationId: ObjectId,
  
  rewardAmount: Number,
  currency: String,
  rewardType: 'PARTICIPATION' | 'COMPLETION' | 'MILESTONE' | 'REFERRAL',
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'FORFEITED',
  
  issuedAt: Date,
  paidAt: Date,
  paymentMethod: 'BANK_TRANSFER' | 'WALLET' | 'VOUCHER',
  
  createdAt: Date
}
```

### 11. Medical Records `medical_records`
**Purpose**: Store patient documents

```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: Patient),
  
  records: [
    {
      type: 'Lab Report' | 'Prescription' | 'Diagnosis',
      fileUrl: String,
      uploadedAt: Date,
      recordDate: Date
    }
  ],
  
  clinicalNotes: [
    {
      note: String,
      writerId: ObjectId,
      createdAt: Date
    }
  ],
  
  isEncrypted: Boolean,
  uploadedBy: ObjectId,
  createdAt: Date
}
```

### 12. Feedback `feedback`
**Purpose**: Collect user feedback on trials

```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  trialId: ObjectId,
  
  rating: Number (1-5),
  feedbackCategory: 'TRIAL_EXPERIENCE' | 'RESEARCHER_SUPPORT' | 'FACILITIES',
  feedback: String,
  pros: [String],
  cons: [String],
  wouldRecommend: Boolean,
  
  createdAt: Date
}
```

### 13. Notifications `notifications`
**Purpose**: User alerts and messages

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  
  type: 'TRIAL_MATCH' | 'APPLICATION_STATUS' | 'REWARD_ISSUED' | 'COMMISSION_PAID' | 'TRIAL_UPDATE',
  title: String,
  message: String,
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  
  isRead: Boolean,
  readAt: Date,
  actionUrl: String,
  actionLabel: String,
  
  expiresAt: Date, // TTL index for auto-deletion
  createdAt: Date
}
```

**TTL Index**: Notifications auto-delete after 30 days

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
GET    /api/auth/profile           - Get user profile
```

### Patients
```
POST   /api/patients               - Create patient profile
GET    /api/patients/:patientId    - Get patient profile
PUT    /api/patients/:patientId    - Update patient profile
GET    /api/patients/stats         - Get patient statistics
GET    /api/patients/search        - Search patients by condition
POST   /api/patients/:id/condition - Add medical condition
PUT    /api/patients/:id/lab-results - Update lab results
POST   /api/patients/:id/export    - Export anonymized data
```

### Trials
```
GET    /api/trials                 - List open trials
GET    /api/trials/:trialId        - Get trial details
POST   /api/trials/:labId/create   - Create trial
PUT    /api/trials/:trialId/status - Update trial status
GET    /api/trials/search          - Search trials
GET    /api/trials/nearby          - Find nearby trials
GET    /api/trials/trending        - Get trending trials
GET    /api/trials/:id/stats       - Get trial statistics
GET    /api/trials/:id/criteria    - Get trial eligibility criteria
POST   /api/trials/:id/criteria    - Setup trial criteria
```

### Matching (AI Engine)
```
GET    /api/matches/patient/:id/generate       - Generate matches for patient
GET    /api/matches/patient/:id/top-matches    - Get top matches
GET    /api/matches/:matchId                   - Get match details
POST   /api/matches/calculate-eligibility      - Calculate eligibility score
POST   /api/matches/:matchId/apply             - Apply to trial
POST   /api/matches/:matchId/reject            - Reject match
POST   /api/matches/batch/generate-all         - Generate matches for all patients
GET    /api/matches/trial/:id/analytics        - Get matching analytics
```

### Applications
```
POST   /api/applications                       - Submit application
GET    /api/applications                       - Get applications
GET    /api/applications/:id                   - Get application details
PUT    /api/applications/:id/approve           - Approve application
PUT    /api/applications/:id/reject            - Reject application
PUT    /api/applications/:id/withdraw          - Withdraw application
GET    /api/applications/trial/:id/stats       - Get application statistics
POST   /api/applications/bulk/approve          - Bulk approve applications
```

### Commissions
```
GET    /api/commissions/doctor/:id             - Get doctor commissions
GET    /api/commissions/doctor/:id/earnings    - Get doctor earnings
GET    /api/commissions/:id                    - Get commission details
PUT    /api/commissions/:id/status             - Update commission status
PUT    /api/commissions/:id/approve            - Approve commission
PUT    /api/commissions/:id/reject             - Reject commission
POST   /api/commissions/bulk/process-payments  - Process payments
GET    /api/commissions/trial/:id/summary      - Get trial commission summary
GET    /api/commissions/stats/all              - Get commission statistics
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB v4.4+
- npm or yarn

### Installation

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinerva
JWT_SECRET=your_jwt_secret_key
EOF

# 3. Start server
npm start # or npm run dev for development
```

### Environment Variables
```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key
```

---

## 📖 Usage Examples

### 1. Create Patient Profile
```bash
POST /api/patients
{
  "age": 52,
  "gender": "Male",
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "coordinates": [72.8777, 19.0760]
  },
  "conditions": ["Type 2 Diabetes"],
  "medications": ["Metformin"],
  "labResults": {
    "HbA1c": 8.2,
    "bloodPressure": "130/90"
  }
}
```

### 2. Generate Matches for Patient
```bash
GET /api/matches/patient/{patientId}/generate

Response:
{
  "success": true,
  "message": "Generated 8 matches for patient",
  "matches": [
    {
      "_id": "...",
      "trialId": "...",
      "eligibilityScore": 0.92,
      "matchReasons": ["Age within range", "HbA1c above threshold"],
      "confidence": 0.94,
      "distanceKm": 12,
      "priorityScore": 0.88
    }
  ]
}
```

### 3. Apply to Trial
```bash
POST /api/applications
{
  "patientId": "...",
  "trialId": "...",
  "doctorId": "..."
}
```

### 4. Approve Application
```bash
PUT /api/applications/{applicationId}/approve
{
  "verifiedBy": "doctorUserId"
}

// Automatically creates:
// - Commission record for doctor
// - Reward record for patient
// - Notification for both
// - Increments trial participants
```

### 5. Get Doctor Earnings
```bash
GET /api/commissions/doctor/{doctorId}/earnings

Response:
{
  "total": 45000,
  "pending": 5000,
  "paid": 40000,
  "approved": 0,
  "processing": 0,
  "cancelled": 0,
  "byTrial": {
    "trialId1": 15000,
    "trialId2": 30000
  }
}
```

---

## 🗂️ Database Indexes

### Critical Indexes (Performance)

```javascript
// Patients - Condition Search
db.patients.createIndex({ conditions: 1 })

// Location-based Queries
db.patients.createIndex({ "location.coordinates": "2dsphere" })
db.doctors.createIndex({ "location.coordinates": "2dsphere" })
db.clinical_trials.createIndex({ "locations.coordinates": "2dsphere" })

// Matching Query
db.trial_matches.createIndex({ patientId: 1, eligibilityScore: -1 })

// Application Status
db.trial_applications.createIndex({ patientId: 1, applicationStatus: 1 })

// Commissions
db.commissions.createIndex({ doctorId: 1, status: 1 })

// Notifications - TTL Auto-Delete
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

---

## 🎯 AI Matching Algorithm

### Scoring System

```javascript
// Eligibility Score = (Inclusion Match % × 0.6) + (Exclusion Match × 0.4)
// Priority Score = (Eligibility Score × 0.7) + (Location Score × 0.3)
// Location Score = 1 - (Distance / 100km)
```

### Matching Logic

1. **Inclusion Criteria Evaluation**
   - Check if patient meets all inclusion criteria
   - +0.1 score for each matching criterion
   
2. **Exclusion Criteria Check**
   - If any exclusion criterion matches, score = 0
   - Stop evaluation (hard disqualification)

3. **Distance Calculation**
   - Haversine formula for geographic distance
   - Closer trials get higher location score

4. **Scoring & Ranking**
   - Combine all scores with weights
   - Sort by priority score (highest first)
   - Return top 10 matches per patient

---

## 📊 Analytics & Reporting

### Available Analytics

- **Patient Statistics**: Demographic breakdown, condition distribution
- **Trial Analytics**: Application rates, approval rates, participant demographics
- **Matching Analytics**: Score distribution, match quality, false positive/negative rates
- **Commission Analytics**: Total paid/pending, payment trends
- **Doctor Performance**: Commission earned, patients referred, ratings

---

## 🔒 Security Considerations

1. **Data Anonymization**: Patient PII stripped, only `anonymousId` shared
2. **Field-level Encryption**: Sensitive lab results encrypted at rest
3. **Role-based Access Control**: Different permissions for patients, doctors, researchers
4. **Audit Logging**: All access logs maintained in `accessLogs[] (MedicalRecord)
5. **JWT Tokens**: Secure authentication with expiring tokens

---

## 📝 License

This implementation is provided for educational and commercial use.

---

## 🤝 Support

For questions or issues with this MongoDB schema implementation, please refer to the inline comments in the model files or the API documentation at `/api`.
