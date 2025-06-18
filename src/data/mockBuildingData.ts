
import { ClientData } from "@/types/TreemapData";

const buildingNames = [
  "Central Plaza", "Tech Tower", "Medical Center", "Shopping Mall", "Office Complex",
  "University Hall", "Conference Center", "Data Center", "Manufacturing Plant", "Warehouse",
  "Hotel Resort", "Apartment Complex", "Sports Arena", "Cultural Center", "Library",
  "Hospital Wing", "Research Lab", "Training Facility", "Operations Center", "Admin Building",
  "Innovation Hub", "Service Center", "Distribution Center", "Financial Tower", "Retail Store"
];

const clients = [
  "TechCorp Industries", "Healthcare Partners", "Retail Solutions", "Education Group",
  "Manufacturing Co", "Real Estate Holdings", "Energy Systems", "Financial Services",
  "Government Facilities", "Entertainment Group"
];

const generateRandomBuilding = (index: number) => {
  const clientIndex = Math.floor(Math.random() * clients.length);
  const nameIndex = Math.floor(Math.random() * buildingNames.length);
  
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
  
  return {
    id: `BLD-${String(index + 1).padStart(3, '0')}`,
    name: `${buildingNames[nameIndex]} ${Math.floor(Math.random() * 99) + 1}`,
    squareMeters: Math.floor(Math.random() * 10000) + 500, // 500-10500 sq meters
    temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
    client: clients[clientIndex],
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
    },
  };
};

// Generate 250 buildings
const allBuildings = Array.from({ length: 250 }, (_, index) => generateRandomBuilding(index));

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
