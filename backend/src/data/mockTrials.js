/**
 * Simulated Clinical Trials Database
 */
export const clinicalTrials = [
  {
    id: "T-8842",
    name: "Advanced Immunotherapy for Solid Tumors",
    phase: "Phase II",
    status: "Recruiting",
    hospital: "UCSF Medical Center",
    location: { city: "San Francisco", state: "CA", coordinates: [37.7749, -122.4194] },
    criteriaText: "Patients aged 40-65 with lung cancer and non-smoker",
    parsedCriteria: {
      minAge: 40,
      maxAge: 65,
      conditions: ["lung cancer", "non-small cell lung cancer", "solid tumor"],
      exclusions: ["smoker", "current smoker"],
      biomarkersRequired: []
    }
  },
  {
    id: "T-3190",
    name: "Targeted Therapy with T-Cell Engagement",
    phase: "Phase III",
    status: "Recruiting",
    hospital: "Stanford Health Care",
    location: { city: "Stanford", state: "CA", coordinates: [37.4241, -122.1661] },
    criteriaText: "Adults over 18 with metastatic melanoma, previously treated with BRAF inhibitors",
    parsedCriteria: {
      minAge: 18,
      maxAge: 120,
      conditions: ["melanoma", "metastatic melanoma"],
      exclusions: ["autoimmune disease"],
      biomarkersRequired: ["BRAF V600E"]
    }
  },
  {
    id: "T-1055",
    name: "Combination Therapy Clinical Study",
    phase: "Phase I/II",
    status: "Active",
    hospital: "UCLA Medical Center",
    location: { city: "Los Angeles", state: "CA", coordinates: [34.0522, -118.2437] },
    criteriaText: "Any age over 18 with solid tumors. Must have adequate organ function.",
    parsedCriteria: {
      minAge: 18,
      maxAge: 120,
      conditions: ["solid tumor", "advanced solid tumor"],
      exclusions: ["severe hepatic impairment", "severe renal impairment"],
      biomarkersRequired: []
    }
  }
];
