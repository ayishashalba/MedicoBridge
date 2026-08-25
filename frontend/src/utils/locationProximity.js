/**
 * Location Proximity & Geographical Ranking Utility for MedicoBridge Blood Donor Search
 */

const DISTRICT_PROXIMITY_MAP = {
  kozhikode: {
    tier1: ["malappuram", "kannur", "wayanad"],
    tier2: ["palakkad", "thrissur"],
    tier3: ["ernakulam", "kochi", "kottayam", "alappuzha", "idukki", "pathanamthitta", "kollam", "thiruvananthapuram", "trivandrum", "kasaragod"]
  },
  malappuram: {
    tier1: ["kozhikode", "palakkad", "thrissur", "wayanad"],
    tier2: ["kannur", "ernakulam", "kochi"],
    tier3: ["kottayam", "alappuzha", "idukki", "pathanamthitta", "kollam", "thiruvananthapuram", "kasaragod"]
  },
  kannur: {
    tier1: ["kozhikode", "kasaragod", "wayanad"],
    tier2: ["malappuram", "palakkad"],
    tier3: ["thrissur", "ernakulam", "kottayam", "alappuzha", "thiruvananthapuram"]
  },
  ernakulam: {
    tier1: ["thrissur", "kottayam", "alappuzha", "idukki"],
    tier2: ["palakkad", "pathanamthitta", "malappuram"],
    tier3: ["kozhikode", "kollam", "thiruvananthapuram", "wayanad", "kannur", "kasaragod"]
  },
  chennai: {
    tier1: ["kanchipuram", "tiruvallur", "chengalpattu"],
    tier2: ["vellore", "pondicherry", "coimbatore", "madurai"],
    tier3: ["salem", "tiruchirappalli"]
  },
  bangalore: {
    tier1: ["mysore", "hosur", "tumkur", "ramanagara"],
    tier2: ["kolar", "mandya", "hassan"],
    tier3: ["mangalore", "hubli"]
  }
};

/**
 * Calculates geographical proximity score between donor location and origin location.
 * Score 0: Exact match
 * Score 1: Immediate neighboring district
 * Score 2: Nearby regional district
 * Score 3: Same state district
 * Score 4: Neighboring state / regional hub
 * Score 5: Distant state / city (e.g., Delhi, Goa)
 */
export function getProximityScore(donorLocation = "", originLocation = "Kozhikode") {
  if (!donorLocation) return 99;

  const donor = donorLocation.trim().toLowerCase();
  const origin = (originLocation || "Kozhikode").trim().toLowerCase();

  // Tier 0: Exact match or direct containment
  if (donor === origin || donor.includes(origin) || origin.includes(donor)) {
    return 0;
  }

  // Check predefined proximity map
  for (const [keyCity, data] of Object.entries(DISTRICT_PROXIMITY_MAP)) {
    if (origin.includes(keyCity) || keyCity.includes(origin)) {
      if (data.tier1.some((c) => donor.includes(c))) return 1;
      if (data.tier2.some((c) => donor.includes(c))) return 2;
      if (data.tier3.some((c) => donor.includes(c))) return 3;
    }
  }

  // Kerala state generic heuristic
  const keralaLocations = [
    "kozhikode", "malappuram", "kannur", "wayanad", "thrissur", "palakkad",
    "ernakulam", "kochi", "kottayam", "alappuzha", "thiruvananthapuram",
    "trivandrum", "kasaragod", "kollam", "idukki", "pathanamthitta"
  ];
  const isOriginKerala = keralaLocations.some((c) => origin.includes(c));
  const isDonorKerala = keralaLocations.some((c) => donor.includes(c));

  if (isOriginKerala && isDonorKerala) {
    return 3;
  }

  // South India generic heuristic
  const southLocations = [
    "kerala", "tamil nadu", "karnataka", "andhra pradesh", "telangana",
    "chennai", "bangalore", "bengaluru", "hyderabad", "coimbatore", "mysore", "mangalore"
  ];
  const isOriginSouth = southLocations.some((s) => origin.includes(s));
  const isDonorSouth = southLocations.some((s) => donor.includes(s));

  if (isOriginSouth && isDonorSouth) {
    return 4;
  }

  return 5; // Distant location (e.g. Delhi, Goa, Mumbai)
}

/**
 * Returns human readable proximity label based on score.
 */
export function getProximityLabel(donorLocation = "", originLocation = "Kozhikode") {
  const score = getProximityScore(donorLocation, originLocation);
  switch (score) {
    case 0: return "Same Location";
    case 1: return "Immediate Neighboring District";
    case 2: return "Nearby District";
    case 3: return "Same State";
    case 4: return "Neighboring State";
    default: return "Distant Region";
  }
}

/**
 * Sorts array of donor records by proximity to origin location.
 * Nearest location donors appear first.
 */
export function sortDonorsByProximity(donors = [], originLocation = "Kozhikode") {
  return [...donors].sort((a, b) => {
    const locA = a.city || a.location || a.branchLocation || a.clinicCity || a.address || "";
    const locB = b.city || b.location || b.branchLocation || b.clinicCity || b.address || "";

    const scoreA = getProximityScore(locA, originLocation);
    const scoreB = getProximityScore(locB, originLocation);

    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }

    return (a.name || "").localeCompare(b.name || "");
  });
}
