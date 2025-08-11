#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock data directly embedded (since we can't import TS files directly)
const buildingNames = [
  "Central Plaza", "Tech Tower", "Medical Center", "Shopping Mall", "Office Complex",
  "University Hall", "Conference Center", "Data Center", "Manufacturing Plant", "Warehouse",
  "Hotel Resort", "Apartment Complex", "Sports Arena", "Cultural Center", "Library",
  "Hospital Wing", "Research Lab", "Training Facility", "Operations Center", "Admin Building",
  "Innovation Hub", "Service Center", "Distribution Center", "Financial Tower", "Retail Store"
];

const clients = [
  "WEESAB", "Siemens", "Framfab", "Akademiska Hus", "Robertos WWIII bunkers",
  "Healthcare Partners", "Retail Solutions", "Manufacturing Co", 
  "Energy Systems", "Stef's castles"
];

const countries = ["Sweden", "Denmark", "Finland", "USA", "Argentina"];



// Generate building data
const generateRandomBuilding = (index, forcedClient) => {
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
    
    // Flattened features - no nested object
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
  };
};

// Generate exactly 250 buildings with WEESAB getting more
const allBuildings = [];
let buildingIndex = 0;

// Simple approach: distribute 250 buildings with WEESAB getting about 3x more
const otherClients = clients.filter(client => client !== "WEESAB");
const totalWeight = otherClients.length + 3; // 9 other clients + 3 weight for WEESAB
const buildingsPerWeight = Math.floor(250 / totalWeight); // ~20 buildings per weight

// Generate buildings for other clients
otherClients.forEach(client => {
  for (let i = 0; i < buildingsPerWeight; i++) {
    allBuildings.push(generateRandomBuilding(buildingIndex++, client));
  }
});

// Generate 3x buildings for WEESAB
for (let i = 0; i < buildingsPerWeight * 3; i++) {
  allBuildings.push(generateRandomBuilding(buildingIndex++, "WEESAB"));
}

// Fill remaining slots to reach exactly 250
while (allBuildings.length < 250) {
  allBuildings.push(generateRandomBuilding(buildingIndex++));
}

// Create flat data structure with only buildings
const flatData = allBuildings;

// Write to JSON file inside public so it gets deployed with the app
const outputPath = join(__dirname, 'public', 'data.json');
try {
  writeFileSync(outputPath, JSON.stringify(flatData, null, 2), 'utf8');
  console.log('✅ Data generated successfully!');
  console.log(`📄 Output file: ${outputPath}`);
  console.log(`📊 Generated ${flatData.length} buildings`);
} catch (error) {
  console.error('❌ Error writing data file:', error);
  process.exit(1);
}