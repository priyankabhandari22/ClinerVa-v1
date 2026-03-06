import { anonymizePatientData } from '../utils/anonymizer.js';
import { matchPatientToTrials } from '../services/matchingEngine.js';

export const processPatientMatch = async (req, res) => {
  try {
    const rawPatientData = req.body;
    
    // Step 1: Anonymize the data (strip PII)
    const anonymizedData = anonymizePatientData(rawPatientData);
    
    // Step 2: Run the Matching Engine
    const matches = matchPatientToTrials(anonymizedData);

    // Provide full transparency of what was analyzed vs original
    res.status(200).json({
      success: true,
      message: "Patient data successfully anonymized and matched.",
      data: {
        anonymousSessionId: anonymizedData.anonymousId,
        inputScrubbed: true,
        matchingResults: matches
      }
    });

  } catch (error) {
    console.error("Error processing match:", error);
    res.status(500).json({ success: false, error: "Internal Server Error during matching." });
  }
};
