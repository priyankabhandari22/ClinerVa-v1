import Bytez from 'bytez.js';
import Patient from '../models/Patient.js';
import ClinicalTrial from '../models/ClinicalTrial.js';
import TrialCriteria from '../models/TrialCriteria.js';

/**
 * AI Matching Service - Enhanced matching using Bytez.js and GPT-4o
 * Provides explainable AI results with detailed reasoning
 */

// Initialize Bytez SDK
const bytezKey = process.env.BYTEZ_API_KEY || 'default_key';
const sdk = new Bytez(bytezKey);
const model = sdk.model(process.env.BYTEZ_MODEL || 'openai/gpt-4o');

class AIMatchingService {
  /**
   * Generate AI-enhanced match explanation
   * Uses GPT-4o to provide detailed reasoning about matches
   */
  static async generateMatchExplanation(patientData, trialData, criteriaData, scoringData) {
    try {
      if (!process.env.BYTEZ_ENABLED || process.env.BYTEZ_ENABLED === 'false') {
        return null; // Skip AI if disabled
      }

      const prompt = `
You are a clinical trial matching expert. Analyze the following patient data and trial information to provide a detailed matching explanation.

PATIENT PROFILE:
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Conditions: ${patientData.conditions.join(', ')}
- Current Medications: ${patientData.medications.join(', ')}
- Lab Results: ${JSON.stringify(patientData.labResults)}
- Location: ${patientData.location.city}, ${patientData.location.state}
- Allergies: ${patientData.allergies.length > 0 ? patientData.allergies.join(', ') : 'None reported'}

CLINICAL TRIAL:
- Title: ${trialData.title}
- Phase: ${trialData.trialPhase}
- Description: ${trialData.description}
- Location: ${trialData.locations.map(l => l.city).join(', ')}
- Eligibility Summary: ${trialData.eligibilitySummary}

MATCHING RESULTS:
- Eligibility Score: ${scoringData.eligibilityScore.toFixed(2)}/1.0
- Location Score: ${scoringData.locationScore.toFixed(2)}/1.0
- Overall Priority: ${scoringData.priorityScore.toFixed(2)}/1.0
- Confidence: ${scoringData.confidence.toFixed(2)}

Please provide:
1. A brief summary (1-2 sentences) of why this is a good/poor match
2. Key matching factors (3-4 factors)
3. Potential contraindications or concerns (if any)
4. Recommendations for the patient or doctor
Keep response concise and professional.
`;

      const { error, output } = await model.run([
        {
          role: 'user',
          content: prompt
        }
      ]);

      if (error) {
        console.warn('AI Match Explanation Error:', error);
        return null;
      }

      return {
        success: true,
        explanation: output,
        timestamp: new Date(),
        model: process.env.BYTEZ_MODEL || 'openai/gpt-4o'
      };
    } catch (error) {
      console.error('AI Matching Service Error:', error);
      return null; // Graceful fallback
    }
  }

  /**
   * Generate personalized trial recommendations
   * Uses AI to suggest trials based on patient needs
   */
  static async generatePersonalizedRecommendations(patientId, topMatches) {
    try {
      if (!process.env.BYTEZ_ENABLED || process.env.BYTEZ_ENABLED === 'false') {
        return null;
      }

      const patient = await Patient.findById(patientId);
      if (!patient) return null;

      const trialsInfo = topMatches.slice(0, 5).map((match, idx) => 
        `${idx + 1}. ${match.trialId.title} - Score: ${(match.eligibilityScore * 100).toFixed(0)}%`
      ).join('\n');

      const prompt = `
You are a healthcare advisor. Based on this patient's profile and their top trial matches, provide personalized recommendations.

PATIENT:
- Age: ${patient.age}, ${patient.gender}
- Conditions: ${patient.conditions.join(', ')}
- Medications: ${patient.medications.join(', ')}
- Location: ${patient.location.city}

TOP TRIAL MATCHES:
${trialsInfo}

Please provide:
1. Which trial(s) best fit the patient's needs and why
2. Key considerations before applying
3. Advice for discussion with their doctor
4. Any lifestyle changes that could improve trial outcomes

Be encouraging and supportive while realistic about expectations.
`;

      const { error, output } = await model.run([
        {
          role: 'user',
          content: prompt
        }
      ]);

      if (error) {
        console.warn('Recommendation Error:', error);
        return null;
      }

      return {
        success: true,
        recommendations: output,
        generatedFor: patientId,
        trialCount: topMatches.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Recommendation Generation Error:', error);
      return null;
    }
  }

  /**
   * Analyze trial criteria using AI
   * Extract and interpret complex eligibility rules
   */
  static async analyzeTrialCriteria(trialId) {
    try {
      if (!process.env.BYTEZ_ENABLED || process.env.BYTEZ_ENABLED === 'false') {
        return null;
      }

      const trial = await ClinicalTrial.findById(trialId);
      const criteria = await TrialCriteria.findOne({ trialId });

      if (!trial || !criteria) return null;

      const prompt = `
Analyze this clinical trial criteria and provide a summary in plain language.

TRIAL: ${trial.title}
DESCRIPTION: ${trial.description}

INCLUSION CRITERIA:
${criteria.inclusionCriteria.map(c => `- ${c.description || c.field}: ${c.operator} ${c.value}`).join('\n')}

EXCLUSION CRITERIA:
${criteria.exclusionCriteria.map(c => `- ${c.description || c.field}: ${c.operator} ${c.value}`).join('\n')}

Please provide:
1. Summary of who is eligible (2-3 sentences)
2. Who would NOT be eligible (common exclusions)
3. Key health parameters important for this trial
4. Questions a potential participant should ask

Use simple, non-medical language where possible.
`;

      const { error, output } = await model.run([
        {
          role: 'user',
          content: prompt
        }
      ]);

      if (error) {
        console.warn('Trial Analysis Error:', error);
        return null;
      }

      return {
        success: true,
        plainLanguageSummary: output,
        trialId: trialId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Trial Analysis Error:', error);
      return null;
    }
  }

  /**
   * Compare multiple trials for a patient
   * Help patient understand differences between options
   */
  static async compareTrials(patientId, trialIds) {
    try {
      if (!process.env.BYTEZ_ENABLED || process.env.BYTEZ_ENABLED === 'false') {
        return null;
      }

      const trials = await ClinicalTrial.find({ _id: { $in: trialIds } });
      if (trials.length === 0) return null;

      const trialComparison = trials.map((trial, idx) =>
        `Trial ${idx + 1}: ${trial.title}
        - Phase: ${trial.trialPhase}
        - Duration: ${trial.duration}
        - Location: ${trial.locations.map(l => l.city).join(', ')}
        - Reward: $${trial.rewardAmount}
        - Objectives: ${trial.objectives.join('; ')}`
      ).join('\n\n');

      const prompt = `
Compare these clinical trials and help a patient understand the key differences.

${trialComparison}

Please provide:
1. Quick comparison table (trial name, phase, commitment level, benefit)
2. Pros and cons of each trial
3. Which might be best for different patient types
4. Questions to ask before choosing

Be neutral and informative.
`;

      const { error, output } = await model.run([
        {
          role: 'user',
          content: prompt
        }
      ]);

      if (error) {
        console.warn('Comparison Error:', error);
        return null;
      }

      return {
        success: true,
        comparison: output,
        patientId: patientId,
        trialsCompared: trialIds.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Trial Comparison Error:', error);
      return null;
    }
  }

  /**
   * Generate FAQ for a trial
   * Help patients understand what to expect
   */
  static async generateTrialFAQ(trialId) {
    try {
      if (!process.env.BYTEZ_ENABLED || process.env.BYTEZ_ENABLED === 'false') {
        return null;
      }

      const trial = await ClinicalTrial.findById(trialId);
      if (!trial) return null;

      const prompt = `
Create an FAQ for potential participants in this clinical trial.

TRIAL: ${trial.title}
PHASE: ${trial.trialPhase}
DURATION: ${trial.duration}
LOCATION: ${trial.locations.map(l => l.city).join(', ')}
REWARD: $${trial.rewardAmount}
DESCRIPTION: ${trial.description}

Generate 8-10 common questions and answers covering:
- What is involved?
- Time commitment?
- Side effects?
- Compensation?
- Eligibility?
- Safety?
- Benefits?
- How to apply?
- What happens after?
- Contact information?

Format as Q&A pairs with clear, accurate information.
`;

      const { error, output } = await model.run([
        {
          role: 'user',
          content: prompt
        }
      ]);

      if (error) {
        console.warn('FAQ Generation Error:', error);
        return null;
      }

      return {
        success: true,
        faq: output,
        trialId: trialId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('FAQ Generation Error:', error);
      return null;
    }
  }

  /**
   * Validate patient eligibility using AI reasoning
   * Provide detailed explanation of why patient is/isn't eligible
   */
  static async validateEligibilityWithAI(patientId, trialId) {
    try {
      if (!process.env.BYTEZ_ENABLED || process.env.BYTEZ_ENABLED === 'false') {
        return null;
      }

      const patient = await Patient.findById(patientId);
      const trial = await ClinicalTrial.findById(trialId);
      const criteria = await TrialCriteria.findOne({ trialId });

      if (!patient || !trial || !criteria) return null;

      const prompt = `
Determine if this patient is eligible for this trial and explain why in detail.

PATIENT:
${JSON.stringify({
  age: patient.age,
  gender: patient.gender,
  conditions: patient.conditions,
  medications: patient.medications,
  allergies: patient.allergies,
  labResults: patient.labResults,
  lifestyle: patient.lifestyle
}, null, 2)}

TRIAL REQUIREMENTS:
Inclusion: ${criteria.inclusionCriteria.map(c => c.description).join('; ')}
Exclusion: ${criteria.exclusionCriteria.map(c => c.description).join('; ')}

Please provide:
1. Overall eligibility (ELIGIBLE, LIKELY ELIGIBLE, BORDERLINE, NOT ELIGIBLE)
2. Detailed reasoning
3. Any flags or concerns
4. Next steps if interested
5. Recommendations for the patient's doctor
`;

      const { error, output } = await model.run([
        {
          role: 'user',
          content: prompt
        }
      ]);

      if (error) {
        console.warn('Eligibility Validation Error:', error);
        return null;
      }

      return {
        success: true,
        eligibilityAnalysis: output,
        patientId: patientId,
        trialId: trialId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Eligibility Validation Error:', error);
      return null;
    }
  }

  /**
   * Check AI service availability
   */
  static async healthCheck() {
    try {
      const { error, output } = await model.run([
        {
          role: 'user',
          content: 'Respond with \"Healthy\" only.'
        }
      ]);

      return {
        status: error ? 'degraded' : 'healthy',
        model: process.env.BYTEZ_MODEL || 'openai/gpt-4o',
        enabled: process.env.BYTEZ_ENABLED !== 'false',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        enabled: process.env.BYTEZ_ENABLED !== 'false',
        timestamp: new Date()
      };
    }
  }
}

export default AIMatchingService;
