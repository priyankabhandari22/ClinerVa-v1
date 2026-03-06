/**
 * Utility to anonymize patient data before processing in the Matching Engine.
 * Removes PII (Personally Identifiable Information).
 */

export function anonymizePatientData(patientData) {
  const {
    name,
    email,
    phone,
    address,
    socialSecurityNumber,
    ...anonymizedData
  } = patientData;

  // Generate a random anonymous ID for tracking the session
  anonymizedData.anonymousId = `ANON-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Optionally fuzz the exact age into an age range or just keep it if critical for medical matching
  // For precise clinical trial matching, age is usually kept but name/contact is stripped.

  return anonymizedData;
}
