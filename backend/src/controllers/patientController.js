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

export default {
  getPatientProfile,
  createPatientProfile,
  updatePatientProfile,
  addCondition,
  updateLabResults,
  getPatientStats,
  searchPatientsByCondition,
  exportAnonymousData
};
