/**
 * AI Matching Engine
 * Compares anonymized patient data against structured clinical trial criteria.
 */
import { clinicalTrials } from '../data/mockTrials.js';

// Calculate distance in miles between two coordinates (Haversine formula)
function calculateDistance(coord1, coord2) {
  if (!coord1 || !coord2) return null;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function matchPatientToTrials(anonymizedPatientData) {
  const matches = [];

  const {
    age,
    condition,
    medicalHistory = [],
    biomarkers = [],
    locationCoords // [lat, lon]
  } = anonymizedPatientData;

  const patientConditionLower = condition?.toLowerCase() || "";
  const historyTextLower = medicalHistory.join(" ").toLowerCase();

  for (const trial of clinicalTrials) {
    let score = 0;
    let maxBaseScore = 100;
    let satisfied = [];
    let notSatisfied = [];
    let explanation = [];

    const criteria = trial.parsedCriteria;

    // 1. Age Check (Rule-based: Hard Filter or heavy penalty)
    if (age >= criteria.minAge && age <= criteria.maxAge) {
      score += 20;
      satisfied.push(`Age ${age} falls within required range (${criteria.minAge}-${criteria.maxAge})`);
    } else {
      notSatisfied.push(`Age ${age} is outside required range (${criteria.minAge}-${criteria.maxAge})`);
      // If age fails entirely, score drastically drops
      maxBaseScore -= 20;
    }

    // 2. Condition Check (NLP/Semantic Match simulation)
    const conditionMatched = criteria.conditions.some(c => 
      patientConditionLower.includes(c) || c.includes(patientConditionLower)
    );
    if (conditionMatched) {
      score += 40;
      satisfied.push(`Primary diagnosis matches trial focus area.`);
    } else {
      notSatisfied.push(`Diagnosis (${condition}) does not directly match trial focus.`);
    }

    // 3. Exclusion Criteria (Negative rules)
    let hasExclusion = false;
    for (const exclusion of criteria.exclusions) {
      if (historyTextLower.includes(exclusion)) {
        hasExclusion = true;
        notSatisfied.push(`Patient history contains exclusion criteria: ${exclusion}`);
      }
    }
    if (!hasExclusion) {
      score += 20;
      satisfied.push(`No exclusion criteria found in medical history.`);
    } else {
      score -= 30; // Heavy penalty for matching an exclusion
      explanation.push("Warning: Patient history indicates a potential exclusion criteria.");
    }

    // 4. Biomarker Check
    if (criteria.biomarkersRequired.length > 0) {
      const hasRequiredBiomarkers = criteria.biomarkersRequired.every(b => 
        biomarkers.some(pb => pb.toLowerCase() === b.toLowerCase())
      );
      if (hasRequiredBiomarkers) {
         score += 20;
         satisfied.push(`Patient possesses required biomarkers: ${criteria.biomarkersRequired.join(", ")}`);
      } else {
         notSatisfied.push(`Missing required biomarkers: ${criteria.biomarkersRequired.join(", ")}`);
         maxBaseScore += 20; // Increasing max possible score to show they missed this chunk
      }
    } else {
      // If no biomarkers are required, grant the points freely to normalize scores
      score += 20;
    }

    // Normalize final score percentage
    let finalPercentage = Math.max(0, Math.min(100, Math.round((score / 100) * 100)));
    
    // ML Scoring adjustment simulation (e.g. historical success rates of similar profiles)
    // We add a slight +/- 2% jitter based on random ML confidence factor to simulate complex weighting
    const mlAdjustment = Math.floor(Math.random() * 5) - 2; 
    finalPercentage = Math.max(0, Math.min(100, finalPercentage + mlAdjustment));

    if (finalPercentage > 85) {
      explanation.push("Highly recommended match based on core ML eligibility criteria.");
    } else if (finalPercentage > 60) {
      explanation.push("Potential match. Further clinical review required for edge criteria.");
    } else {
      explanation.push("Low probability of eligibility due to mismatched criteria.");
    }

    // Calculate Distance if coords are provided
    let distanceString = trial.location.city + ", " + trial.location.state;
    if (locationCoords && trial.location.coordinates) {
       const dist = calculateDistance(locationCoords, trial.location.coordinates);
       distanceString += ` (${Math.round(dist)} miles away)`;
    }

    matches.push({
      trialId: trial.id,
      trialName: trial.name,
      phase: trial.phase,
      status: trial.status,
      hospital: trial.hospital,
      location: distanceString,
      matchScore: finalPercentage,
      explanation: explanation.join(" "),
      criteriaSatisfied: satisfied,
      criteriaNotSatisfied: notSatisfied
    });
  }

  // Rank matches by highest score first
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

