import { anonymizePatientData } from './src/utils/anonymizer.js';
import { matchPatientToTrials } from './src/services/matchingEngine.js';

// Simulated raw patient data that a doctor might upload
const rawPatientUpload = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  phone: "555-123-4567",
  socialSecurityNumber: "000-00-0000",
  address: "123 Main St, San Francisco, CA",
  age: 45,
  condition: "Non-Small Cell Lung Cancer",
  medicalHistory: ["Diagnosed in 2024", "No prior immunotherapy", "smoker in 1990"],
  biomarkers: ["PD-L1", "EGFR negative"],
  locationCoords: [37.7749, -122.4194] // SF coordinates
};

console.log("--- ORIGINAL RAW DATA ---");
console.log(rawPatientUpload);
console.log("\n-------------------------");

// Step 1: Anonymize
const anonymized = anonymizePatientData(rawPatientUpload);
console.log("\n--- ANONYMIZED DATA FOR AI ENGINE ---");
console.log(anonymized);
console.log(`PII Scrubbed. Tracking ID: ${anonymized.anonymousId}`);
console.log("-------------------------\n");

// Step 2: Match
const results = matchPatientToTrials(anonymized);

console.log("--- AI MATCHING RESULTS ---\n");
results.forEach((match, index) => {
  console.log(`${index + 1}. [${match.matchScore}% MATCH] ${match.trialName} (${match.phase})`);
  console.log(`   Location: ${match.location}`);
  console.log(`   Explanation: ${match.explanation}`);
  console.log(`   ✅ Satisfied Criteria: ${match.criteriaSatisfied.join(" | ")}`);
  if (match.criteriaNotSatisfied.length > 0) {
    console.log(`   ❌ Unmet Criteria: ${match.criteriaNotSatisfied.join(" | ")}`);
  }
  console.log("\n");
});
