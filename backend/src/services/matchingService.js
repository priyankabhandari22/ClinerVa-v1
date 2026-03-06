import Patient from '../models/Patient.js';
import ClinicalTrial from '../models/ClinicalTrial.js';
import TrialCriteria from '../models/TrialCriteria.js';
import TrialMatch from '../models/TrialMatch.js';

/**
 * AI Clinical Trial Matching Engine Service
 * Uses rule-based and scoring algorithms to match patients with trials
 */

class MatchingService {
  /**
   * Calculate eligibility score for a patient against a trial
   */
  static async calculateEligibilityScore(patientId, trialId) {
    const patient = await Patient.findById(patientId);
    const trial = await ClinicalTrial.findById(trialId);
    const criteria = await TrialCriteria.findOne({ trialId });

    if (!patient || !trial || !criteria) {
      throw new Error('Patient, Trial, or Criteria not found');
    }

    let score = 1.0;
    let matchReasons = [];
    let exclusionReasons = [];

    // Check inclusion criteria
    for (const criterion of criteria.inclusionCriteria) {
      const fieldValue = this.getPatientFieldValue(patient, criterion.field);
      const isMatch = this.evaluateCriterion(fieldValue, criterion.operator, criterion.value);

      if (isMatch) {
        score += 0.1; // Positive score for matching inclusion criteria
        matchReasons.push(`✓ ${criterion.description || criterion.field}`);
      } else {
        score -= 0.15; // Penalize for not matching inclusion criteria
      }
    }

    // Check exclusion criteria (strict - should NOT match)
    for (const criterion of criteria.exclusionCriteria) {
      const fieldValue = this.getPatientFieldValue(patient, criterion.field);
      const isExcluded = this.evaluateCriterion(fieldValue, criterion.operator, criterion.value);

      if (isExcluded) {
        score = 0; // Zero out score if excluded
        exclusionReasons.push(`✗ ${criterion.description || criterion.field}`);
        break; // Stop evaluating if excluded
      }
    }

    // Normalize score to 0-1 range
    score = Math.max(0, Math.min(1, score / 1.5));

    return {
      score,
      matchReasons,
      exclusionReasons,
      confidence: score > 0 ? 0.85 + score * 0.15 : 0 // Confidence based on score
    };
  }

  /**
   * Get field value from patient document
   */
  static getPatientFieldValue(patient, field) {
    const fieldMap = {
      'age': patient.age,
      'gender': patient.gender,
      'condition': patient.conditions,
      'HbA1c': patient.labResults?.HbA1c,
      'bloodPressure': patient.labResults?.bloodPressure,
      'smoking': patient.lifestyle?.smoking,
      'alcohol': patient.lifestyle?.alcohol,
    };

    return fieldMap[field] || null;
  }

  /**
   * Evaluate if a value matches a criterion
   */
  static evaluateCriterion(value, operator, criterionValue) {
    if (value === null || value === undefined) return false;

    switch (operator) {
      case 'equals':
        return value === criterionValue;
      case 'between':
        return Array.isArray(criterionValue) &&
          value >= criterionValue[0] && value <= criterionValue[1];
      case '>':
        return value > criterionValue;
      case '<':
        return value < criterionValue;
      case '>=':
        return value >= criterionValue;
      case '<=':
        return value <= criterionValue;
      case 'contains':
        if (Array.isArray(value)) {
          return value.some(v => String(v).toLowerCase().includes(String(criterionValue).toLowerCase()));
        }
        return String(value).toLowerCase().includes(String(criterionValue).toLowerCase());
      case 'in':
        return Array.isArray(criterionValue) && criterionValue.includes(value);
      case 'not_in':
        return Array.isArray(criterionValue) && !criterionValue.includes(value);
      default:
        return false;
    }
  }

  /**
   * Calculate distance between patient and trial location
   */
  static calculateDistance(patientCoords, trialCoords) {
    if (!patientCoords || !trialCoords) return 0;

    const deg2rad = (deg) => deg * (Math.PI / 180);
    const R = 6371; // Radius of Earth in km

    const dLat = deg2rad(trialCoords[1] - patientCoords[1]);
    const dLon = deg2rad(trialCoords[0] - patientCoords[0]);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(patientCoords[1])) * Math.cos(deg2rad(trialCoords[1])) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
  }

  /**
   * Generate matches for a patient
   */
  static async generateMatchesForPatient(patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    const openTrials = await ClinicalTrial.find({ status: 'OPEN' });
    const matches = [];

    for (const trial of openTrials) {
      try {
        const eligibility = await this.calculateEligibilityScore(patientId, trial._id);

        if (eligibility.score > 0) {
          // Calculate location score
          let distanceKm = 0;
          let locationScore = 1;

          if (patient.location?.coordinates.coordinates && trial.locations?.length > 0) {
            const distances = trial.locations.map(loc =>
              this.calculateDistance(
                patient.location.coordinates.coordinates,
                loc.coordinates.coordinates
              )
            );
            distanceKm = Math.min(...distances);
            locationScore = Math.max(0, 1 - (distanceKm / 100)); // 100km = 0 score
          }

          const priorityScore = (eligibility.score * 0.7) + (locationScore * 0.3);

          matches.push({
            patientId,
            trialId: trial._id,
            eligibilityScore: eligibility.score,
            matchReasons: eligibility.matchReasons,
            exclusionReasons: eligibility.exclusionReasons,
            confidence: eligibility.confidence,
            distanceKm,
            locationScore,
            priorityScore,
            algorithmVersion: '1.0'
          });
        }
      } catch (error) {
        console.warn(`Error matching patient ${patientId} with trial ${trial._id}:`, error.message);
      }
    }

    // Sort by priority score descending
    matches.sort((a, b) => b.priorityScore - a.priorityScore);

    return matches;
  }

  /**
   * Save matches to database
   */
  static async saveMatches(matchData) {
    try {
      // Remove old matches for this patient
      await TrialMatch.deleteMany({ patientId: matchData[0]?.patientId });

      // Insert new matches
      const created = await TrialMatch.insertMany(matchData);
      return created;
    } catch (error) {
      throw new Error(`Error saving matches: ${error.message}`);
    }
  }

  /**
   * Get top matches for a patient
   */
  static async getTopMatches(patientId, limit = 5) {
    const matches = await TrialMatch.find({ patientId })
      .sort({ priorityScore: -1 })
      .limit(limit)
      .populate('trialId', 'title description rewardAmount')
      .exec();

    return matches;
  }

  /**
   * Update match status
   */
  static async updateMatchStatus(matchId, status) {
    let updateData = { status };
    if (status === 'VIEWED') {
      updateData.viewedAt = new Date();
    }
    if (status === 'EXPIRED') {
      updateData.expiresAt = new Date();
    }

    return await TrialMatch.findByIdAndUpdate(matchId, updateData, { new: true });
  }

  /**
   * Batch generate matches for all patients
   */
  static async generateMatchesForAllPatients() {
    const patients = await Patient.find({}).select('_id');
    const results = [];

    for (const patient of patients) {
      try {
        const matches = await this.generateMatchesForPatient(patient._id);
        if (matches.length > 0) {
          const saved = await this.saveMatches(matches);
          results.push({
            patientId: patient._id,
            matchesGenerated: saved.length,
            status: 'success'
          });
        }
      } catch (error) {
        results.push({
          patientId: patient._id,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return results;
  }

  /**
   * Get matching analytics
   */
  static async getMatchingAnalytics(trialId) {
    const matches = await TrialMatch.find({ trialId });

    const analytics = {
      trialId,
      totalMatches: matches.length,
      averageEligibilityScore: matches.length > 0
        ? matches.reduce((sum, m) => sum + m.eligibilityScore, 0) / matches.length
        : 0,
      highScoreMatches: matches.filter(m => m.eligibilityScore >= 0.8).length,
      averageDistance: matches.length > 0
        ? matches.reduce((sum, m) => sum + m.distanceKm, 0) / matches.length
        : 0,
      scoreDistribution: {
        poor: matches.filter(m => m.eligibilityScore < 0.3).length,
        moderate: matches.filter(m => m.eligibilityScore >= 0.3 && m.eligibilityScore < 0.6).length,
        good: matches.filter(m => m.eligibilityScore >= 0.6 && m.eligibilityScore < 0.8).length,
        excellent: matches.filter(m => m.eligibilityScore >= 0.8).length
      }
    };

    return analytics;
  }
}

export default MatchingService;
