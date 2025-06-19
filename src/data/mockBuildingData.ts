
import { ClientData } from "@/types/TreemapData";

const buildingNames = [
  "Central Plaza", "Tech Tower", "Medical Center", "Shopping Mall", "Office Complex",
  "University Hall", "Conference Center", "Data Center", "Manufacturing Plant", "Warehouse",
  "Hotel Resort", "Apartment Complex", "Sports Arena", "Cultural Center", "Library",
  "Hospital Wing", "Research Lab", "Training Facility", "Operations Center", "Admin Building",
  "Innovation Hub", "Service Center", "Distribution Center", "Financial Tower", "Retail Store"
];

const clients = [
  "SISAB", "Scheider", "Framfab", "Akademiska Hus", "Robertos WWIII bunkers",
  "Healthcare Partners", "Retail Solutions", "Manufacturing Co", 
  "Energy Systems", "Stef's castles"
];

const countries = ["Sweden", "Denmark", "Finland", "USA", "Argentina"];

const generateRandomBuilding = (index: number, forcedClient?: string) => {
  const clientIndex = forcedClient ? clients.indexOf(forcedClient) : Math.floor(Math.random() * clients.length);
  const nameIndex = Math.floor(Math.random() * buildingNames.length);
  const countryIndex = Math.floor(Math.random() * countries.length);
  
  // Generate energy saving values biased towards positive (energy saving)
  const generateEnergySaving = () => {
    const rand = Math.random();
    if (rand < 0.15) {
      // 15% chance of energy wasting (-30% to 0%)
      return (Math.random() - 1) * 0.3;
    } else {
      // 85% chance of energy saving (0% to +30%)
      return Math.random() * 0.3;
    }
  };

  // Generate uptime values biased towards good uptime
  const generateUptime = () => {
    const rand = Math.random();
    if (rand < 0.75) {
      // 75% chance of excellent uptime (95-100%)
      return 0.95 + Math.random() * 0.05;
    } else if (rand < 0.90) {
      // 15% chance of good uptime (90-95%)
      return 0.90 + Math.random() * 0.05;
    } else if (rand < 0.97) {
      // 7% chance of fair uptime (80-90%)
      return 0.80 + Math.random() * 0.10;
    } else {
      // 3% chance of poor uptime (50-80%)
      return 0.50 + Math.random() * 0.30;
    }
  };
  
  return {
    id: `BLD-${String(index + 1).padStart(4, '0')}`,
    name: `${buildingNames[nameIndex]} ${Math.floor(Math.random() * 99) + 1}`,
    squareMeters: Math.floor(Math.random() * 10000) + 500, // 500-10500 sq meters
    temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
    client: forcedClient || clients[clientIndex],
    country: countries[countryIndex],
    isOnline: Math.random() > 0.1, // 90% online
    features: {
      adaptiveMin: Math.random(), // 0-1 random value
      adaptiveMax: Math.random(), // 0-1 random value
      hasClimateBaseline: Math.random() > 0.3, // 70% have baseline
      hasReadWriteDiscrepancies: Math.random() > 0.8, // 20% have discrepancies
      hasZoneAssets: Math.random() > 0.98, // Only 3 buildings (~1.2% of 250)
      hasHeatingCircuit: Math.random() > 0.25, // 75% have heating circuit
      hasVentilation: Math.random() > 0.4, // 60% have ventilation
      missingVSGTOVConnections: Math.random() > 0.85, // 15% missing VSGT OV
      missingLBGPOVConnections: Math.random() > 0.82, // 18% missing LBGP OV
      missingLBGTOVConnections: Math.random() > 0.88, // 12% missing LBGT OV
      savingEnergy: generateEnergySaving(), // Biased towards positive energy saving
      automaticComfortScheduleActive: Math.random() > 0.6, // 40% have automatic schedule
      manualComfortScheduleActive: Math.random() > 0.7, // 30% have manual schedule
      componentsErrors: Math.random() > 0.9, // 10% have component errors
      modelTrainingTestR2Score: Math.random(), // 0-1 random score
      hasDistrictHeatingMeter: Math.random() > 0.5, // 50% have district heating meter
      hasDistrictCoolingMeter: Math.random() > 0.6, // 40% have district cooling meter
      hasElectricityMeter: Math.random() > 0.2, // 80% have electricity meter
      lastWeekUptime: generateUptime(), // Biased towards good uptime
    },
  };
};

// Generate buildings with SISAB getting 3x more
const allBuildings = [];
let buildingIndex = 0;

// First, generate normal distribution for non-SISAB clients
const otherClients = clients.filter(client => client !== "SISAB");
const buildingsPerOtherClient = Math.floor(200 / otherClients.length); // Reserve 50 extra for SISAB

otherClients.forEach(client => {
  for (let i = 0; i < buildingsPerOtherClient; i++) {
    allBuildings.push(generateRandomBuilding(buildingIndex++, client));
  }
});

// Generate 3x more buildings for SISAB
const sisabBuildingCount = buildingsPerOtherClient * 3;
for (let i = 0; i < sisabBuildingCount; i++) {
  allBuildings.push(generateRandomBuilding(buildingIndex++, "SISAB"));
}

// Fill remaining slots with random assignments to reach 250 total
while (allBuildings.length < 250) {
  allBuildings.push(generateRandomBuilding(buildingIndex++));
}

// Group by client
const clientGroups: { [key: string]: typeof allBuildings } = {};
allBuildings.forEach(building => {
  if (!clientGroups[building.client]) {
    clientGroups[building.client] = [];
  }
  clientGroups[building.client].push(building);
});

export const mockBuildingData: ClientData[] = Object.entries(clientGroups).map(([clientName, buildings]) => ({
  name: clientName,
  children: buildings
}));
