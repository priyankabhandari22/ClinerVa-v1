import mongoose from 'mongoose';

/**
 * Medical Record Schema - Detailed medical files and records for patients
 */
const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    records: [
      {
        type: {
          type: String,
          enum: ['Lab Report', 'Prescription', 'Diagnosis', 'Imaging', 'Procedure Report', 'Other'],
          required: true
        },
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        uploadedAt: {
          type: Date,
          default: Date.now
        },
        recordDate: Date,
        description: String,
        documentId: String
      }
    ],
    clinicalNotes: [
      {
        note: String,
        writerName: String,
        writerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isEncrypted: {
      type: Boolean,
      default: true
    },
    accessLogs: [
      {
        accessedBy: mongoose.Schema.Types.ObjectId,
        accessedAt: Date,
        accessReason: String
      }
    ]
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patientId: 1 });
medicalRecordSchema.index({ 'records.uploadedAt': -1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
