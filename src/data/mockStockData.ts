
import { StockData } from "@/types/TreemapData";

const stockNames = [
  "Apple Inc.", "Microsoft Corp.", "Amazon.com Inc.", "Alphabet Inc.", "Tesla Inc.",
  "Meta Platforms Inc.", "NVIDIA Corp.", "Berkshire Hathaway", "Johnson & Johnson", "JPMorgan Chase",
  "Procter & Gamble", "Visa Inc.", "Mastercard Inc.", "UnitedHealth Group", "Home Depot",
  "Bank of America", "Pfizer Inc.", "Coca-Cola Co.", "Walt Disney Co.", "Netflix Inc.",
  "Adobe Inc.", "Salesforce Inc.", "PayPal Holdings", "Intel Corp.", "Cisco Systems",
  "Comcast Corp.", "PepsiCo Inc.", "Abbott Laboratories", "Thermo Fisher Scientific", "Broadcom Inc."
];

const sectors = [
  "Technology", "Healthcare", "Financial Services", "Consumer Discretionary", 
  "Communication Services", "Industrials", "Consumer Staples", "Energy", "Utilities", "Materials"
];

const generateRandomStock = (index: number) => {
  const sectorIndex = Math.floor(Math.random() * sectors.length);
  const nameIndex = Math.floor(Math.random() * stockNames.length);
  
  return {
    symbol: `STOCK${index + 1}`,
    name: stockNames[nameIndex],
    price: Math.floor(Math.random() * 500) + 10,
    change: (Math.random() - 0.5) * 10, // -5 to +5
    sector: sectors[sectorIndex],
    marketCap: Math.floor(Math.random() * 1000) + 100,
  };
};

// Generate 100 stocks
const allStocks = Array.from({ length: 100 }, (_, index) => generateRandomStock(index));

// Group by sector
const sectorGroups: { [key: string]: typeof allStocks } = {};
allStocks.forEach(stock => {
  if (!sectorGroups[stock.sector]) {
    sectorGroups[stock.sector] = [];
  }
  sectorGroups[stock.sector].push(stock);
});

export const mockStockData: SectorData[] = Object.entries(sectorGroups).map(([sectorName, stocks]) => ({
  name: sectorName,
  children: stocks
}));
