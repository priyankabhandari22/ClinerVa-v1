import PatientService from '../services/patientService.js';

/**
 * Patient Controller - Handle patient API requests
 */

const getPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await PatientService.getPatientProfile(patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const patient = await PatientService.getPatientByUserId(userId);

    // If no profile yet, return an empty but successful body
    if (!patient) {
       return res.json({ success: true, patient: null });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upsertMyProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { 
      age, 
      gender, 
      location, 
      diagnosis, 
      medications, 
      surgicalHistory, 
      labResults, 
      smokingStatus 
    } = req.body;

    // Parse medications string to array if provided as comma-separated string
    let parsedMedications = [];
    if (typeof medications === 'string') {
      parsedMedications = medications.split(',').map(m => m.trim()).filter(Boolean);
    } else if (Array.isArray(medications)) {
      parsedMedications = medications;
    }

    // Compile the update data
    const updateData = {
      age,
      gender,
      location,
      diagnosis,
      medications: parsedMedications,
      surgicalHistory,
      labResults,
      smokingStatus
    };
    
    // Also push the diagnosis to 'conditions' array so existing queries don't break
    if (diagnosis) {
      updateData.$addToSet = { conditions: diagnosis };
    }

    const patient = await PatientService.upsertPatientProfile(userId, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPatientProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const patient = await PatientService.createPatientProfile(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await PatientService.updatePatientProfile(patientId, req.body);

    res.json({
      success: true,
      message: 'Patient profile updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCondition = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { condition } = req.body;

    if (!condition) {
      return res.status(400).json({ error: 'Condition is required' });
    }

    const patient = await PatientService.addCondition(patientId, condition);

    res.json({
      success: true,
      message: 'Condition added successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateLabResults = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { labResults } = req.body;

    if (!labResults | typeof labResults !== 'object') {
      return res.status(400).json({ error: 'Valid lab results are required' });
    }

    const patient = await PatientService.updateLabResults(patientId, labResults);

    res.json({
      success: true,
      message: 'Lab results updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPatientStats = async (req, res) => {
  try {
    const stats = await PatientService.getPatientStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchPatientsByCondition = async (req, res) => {
  try {
    const { condition } = req.query;

    if (!condition) {
      return res.status(400).json({ error: 'Condition search term is required' });
    }

    const patients = await PatientService.searchByCondition(condition);

    res.json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportAnonymousData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { fields } = req.body;

    const data = await PatientService.exportAnonymousData(patientId, fields);

    res.json({
      success: true,
      message: 'Data exported successfully',
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await PatientService.getMedicalRecords(patientId);

    res.json({
      success: true,
      records
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMedicalRecordsMe = async (req, res) => {
  try {
    const { userId } = req.user;
    const records = await PatientService.getMedicalRecordsByUserId(userId);

    res.json({
      success: true,
      records
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addMedicalRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { userId } = req.user;
    const recordData = req.body;

    // Add uploadedBy user info
    const record = await PatientService.addMedicalRecord(patientId, {
      ...recordData,
      uploadedBy: userId
    });

    res.json({
      success: true,
      message: 'Medical record added successfully',
      record
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const addClinicalNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { userId } = req.user;
    const noteData = req.body;

    const record = await PatientService.addClinicalNote(patientId, userId, noteData);

    res.json({
      success: true,
      message: 'Clinical note added successfully',
      record
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSavedTrials = async (req, res) => {
  try {
    const userId = req.user._id;
    const savedTrials = await PatientService.getSavedTrials(userId);
    res.json({ success: true, savedTrials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveTrial = async (req, res) => {
  try {
    const userId = req.user._id;
    const trialData = req.body;
    
    if (!trialData || !trialData.trialId) {
       return res.status(400).json({ error: 'Valid trial data including trialId is required' });
    }

    const result = await PatientService.saveTrial(userId, trialData);
    res.json(result);
  } catch (error) {
    console.error(">>> SAVE TRIAL ERROR:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

const removeSavedTrial = async (req, res) => {
  try {
    const userId = req.user._id;
    const { trialId } = req.params;

    if (!trialId) {
       return res.status(400).json({ error: 'trialId parameter is required' });
    }

    const result = await PatientService.removeSavedTrial(userId, trialId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getPatientProfile,
  getMyProfile,
  upsertMyProfile,
  createPatientProfile,
  updatePatientProfile,
  addCondition,
  updateLabResults,
  getPatientStats,
  searchPatientsByCondition,
  exportAnonymousData,
  getMedicalRecords,
  getMedicalRecordsMe,
  addMedicalRecord,
  addClinicalNote,
  getSavedTrials,
  saveTrial,
  removeSavedTrial
};
