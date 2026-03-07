import Patient from '../models/Patient.js';
import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';
import crypto from 'crypto';

/**
 * Patient Service - Handle patient-related operations
 */

class PatientService {
  /**
   * Create a new patient profile
   */
  static async createPatientProfile(userId, patientData) {
    // Generate anonymousId
    const anonymousId = `PAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const patient = new Patient({
      userId,
      anonymousId,
      ...patientData
    });

    return await patient.save();
  }

  /**
   * Get patient profile
   */
  static async getPatientProfile(patientId) {
    return await Patient.findById(patientId)
      .populate('userId', 'email')
      .populate('doctorId', 'name hospital specialization')
      .exec();
  }

  /**
   * Update patient profile
   */
  static async updatePatientProfile(patientId, updateData) {
    // Prevent userId and anonymousId from being updated
    delete updateData.userId;
    delete updateData.anonymousId;

    return await Patient.findByIdAndUpdate(patientId, updateData, { new: true });
  }

  /**
   * Upsert the logged-in user's patient profile
   */
  static async upsertPatientProfile(userId, updateData) {
    // Ensure anonymousId exists if we are inserting
    const anonymousId = `PAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return await Patient.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { anonymousId },
        $set: updateData
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
  }

  /**
   * Get patient by userId
   */
  static async getPatientByUserId(userId) {
    return await Patient.findOne({ userId })
      .populate('doctorId', 'name hospital specialization')
      .exec();
  }

  /**
   * Add or update medical condition for patient
   */
  static async addCondition(patientId, condition) {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    if (!patient.conditions.includes(condition)) {
      patient.conditions.push(condition);
      await patient.save();
    }

    return patient;
  }

  /**
   * Add or update medication for patient
   */
  static async addMedication(patientId, medication) {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    if (!patient.medications.includes(medication)) {
      patient.medications.push(medication);
      await patient.save();
    }

    return patient;
  }

  /**
   * Update lab results
   */
  static async updateLabResults(patientId, labResults) {
    return await Patient.findByIdAndUpdate(
      patientId,
      { labResults },
      { new: true }
    );
  }

  /**
   * Assign doctor to patient
   */
  static async assignDoctor(patientId, doctorId) {
    return await Patient.findByIdAndUpdate(
      patientId,
      { doctorId },
      { new: true }
    );
  }

  /**
   * Get patients by doctor
   */
  static async getPatientsByDoctor(doctorId) {
    return await Patient.find({ doctorId }).select('-labResults');
  }

  /**
   * Search patients by condition
   */
  static async searchByCondition(condition) {
    return await Patient.find({
      conditions: { $in: [condition] }
    }).select('_id anonymousId age gender conditions');
  }

  /**
   * Find patients within radius
   */
  static async findPatientsNearby(coordinates, maxDistance = 50) {
    return await Patient.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      }
    });
  }

  /**
   * Get patient statistics
   */
  static async getPatientStats() {
    const total = await Patient.countDocuments();
    const byGender = await Patient.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    const avgAge = await Patient.aggregate([
      { $group: { _id: null, avgAge: { $avg: '$age' } } }
    ]);
    const topConditions = await Patient.aggregate([
      { $unwind: '$conditions' },
      { $group: { _id: '$conditions', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      totalPatients: total,
      byGender,
      averageAge: avgAge[0]?.avgAge || 0,
      topConditions
    };
  }

  /**
   * Export patient data (anonymized for research)
   */
  static async exportAnonymousData(patientId, fields = ['age', 'gender', 'conditions', 'labResults']) {
    const patient = await Patient.findById(patientId).select(fields);

    if (!patient) throw new Error('Patient not found');

    // Anonymize sensitive data
    const anonymized = {
      anonymousId: patient.anonymousId,
      ageGroup: this.getAgeGroup(patient.age),
      gender: patient.gender,
      conditions: patient.conditions,
      labResults: patient.labResults,
      exportedAt: new Date()
    };

    return anonymized;
  }

  /**
   * Categorize age into groups
   */
  static getAgeGroup(age) {
    if (age < 18) return '0-17';
    if (age < 30) return '18-29';
    if (age < 40) return '30-39';
    if (age < 50) return '40-49';
    if (age < 60) return '50-59';
    if (age < 70) return '60-69';
    return '70+';
  }

  /**
   * Batch update patient data
   */
  static async batchUpdate(updates) {
    const results = [];

    for (const update of updates) {
      try {
        const result = await this.updatePatientProfile(update.patientId, update.data);
        results.push({ patientId: update.patientId, status: 'success' });
      } catch (error) {
        results.push({ patientId: update.patientId, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  /**
   * Get medical records for a patient
   */
  static async getMedicalRecords(patientId) {
    const medicalRecord = await MedicalRecord.findOne({ patientId })
      .populate('uploadedBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('clinicalNotes.writerId', 'name role')
      .exec();

    return medicalRecord || { records: [], clinicalNotes: [] };
  }

  /**
   * Get medical records for logged-in patient user
   */
  static async getMedicalRecordsByUserId(userId) {
    // Find patient by userId
    const patient = await Patient.findOne({ userId });
    if (!patient) throw new Error('Patient profile not found');

    // Get medical records for this patient
    return await this.getMedicalRecords(patient._id);
  }

  /**
   * Add medical record for patient
   */
  static async addMedicalRecord(patientId, recordData) {
    let medicalRecord = await MedicalRecord.findOne({ patientId });

    if (!medicalRecord) {
      medicalRecord = new MedicalRecord({
        patientId,
        records: [],
        clinicalNotes: []
      });
    }

    // Add new record
    if (recordData.fileUrl || recordData.description) {
      medicalRecord.records.push({
        type: recordData.type || 'Other',
        fileUrl: recordData.fileUrl,
        fileName: recordData.fileName,
        fileSize: recordData.fileSize,
        recordDate: recordData.recordDate || new Date(),
        description: recordData.description,
        documentId: recordData.documentId
      });
    }

    return await medicalRecord.save();
  }

  /**
   * Add clinical note to medical records
   */
  static async addClinicalNote(patientId, userId, note) {
    let medicalRecord = await MedicalRecord.findOne({ patientId });

    if (!medicalRecord) {
      medicalRecord = new MedicalRecord({
        patientId,
        records: [],
        clinicalNotes: []
      });
    }

    // Get user info for writer details
    const user = await User.findById(userId);

    medicalRecord.clinicalNotes.push({
      note,
      writerName: user?.name || 'Unknown',
      writerId: userId,
      createdAt: new Date()
    });

    return await medicalRecord.save();
  }
}

export default PatientService;
