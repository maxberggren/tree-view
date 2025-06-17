
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
  
  return {
    id: `BLD-${String(index + 1).padStart(3, '0')}`,
    name: `${buildingNames[nameIndex]} ${Math.floor(Math.random() * 99) + 1}`,
    squareMeters: Math.floor(Math.random() * 10000) + 500, // 500-10500 sq meters
    temperature: Math.floor(Math.random() * 60) + 15, // 15-75°F
    client: clients[clientIndex],
    isOnline: Math.random() > 0.1, // 90% online
    features: {
      canHeat: Math.random() > 0.2, // 80% can heat
      canCool: Math.random() > 0.15, // 85% can cool
      hasAMM: Math.random() > 0.4, // 60% have AMM
      hasClimateBaseline: Math.random() > 0.3, // 70% have baseline
      hasReadWriteDiscrepancies: Math.random() > 0.8, // 20% have discrepancies
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
