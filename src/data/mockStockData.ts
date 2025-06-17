
import { SectorData } from "@/types/TreemapData";

export const mockStockData: SectorData[] = [
  {
    name: "TECHNOLOGY",
    children: [
      { symbol: "MSFT", name: "Microsoft", value: 2800, change: -0.95, sector: "SOFTWARE-INFRASTRUCTURE" },
      { symbol: "AAPL", name: "Apple", value: 3200, change: 1.63, sector: "CONSUMER ELECTRONICS" },
      { symbol: "GOOGL", name: "Alphabet", value: 1800, change: -1.85, sector: "INTERNET CONTENT & INFO" },
      { symbol: "NVDA", name: "NVIDIA", value: 1600, change: -1.22, sector: "SEMICONDUCTORS" },
      { symbol: "META", name: "Meta", value: 800, change: -0.87, sector: "INTERNET CONTENT & INFO" },
      { symbol: "TSLA", name: "Tesla", value: 900, change: -0.09, sector: "AUTO MANUFACTURER" },
      { symbol: "NFLX", name: "Netflix", value: 200, change: 0.11, sector: "ENTERTAINMENT" },
      { symbol: "ADBE", name: "Adobe", value: 240, change: -0.77, sector: "SOFTWARE-APPLICATION" },
      { symbol: "CRM", name: "Salesforce", value: 220, change: -0.45, sector: "SOFTWARE-APPLICATION" },
      { symbol: "ORCL", name: "Oracle", value: 320, change: -1.15, sector: "SOFTWARE-INFRASTRUCTURE" }
    ]
  },
  {
    name: "FINANCIAL",
    children: [
      { symbol: "JPM", name: "JPMorgan", value: 450, change: -1.86, sector: "BANKS-DIVERSIFIED" },
      { symbol: "V", name: "Visa", value: 500, change: -0.26, sector: "CREDIT SERVICES" },
      { symbol: "MA", name: "Mastercard", value: 380, change: -0.26, sector: "CREDIT SERVICES" },
      { symbol: "BRK-B", name: "Berkshire", value: 780, change: -0.72, sector: "INSURANCE-DIVERSIFIED" },
      { symbol: "BAC", name: "Bank of America", value: 280, change: -1.44, sector: "BANKS-DIVERSIFIED" },
      { symbol: "WFC", name: "Wells Fargo", value: 180, change: -1.25, sector: "BANKS-REGIONAL" }
    ]
  },
  {
    name: "HEALTHCARE",
    children: [
      { symbol: "JNJ", name: "Johnson & Johnson", value: 460, change: -0.59, sector: "DRUG MANUFACTURERS-GENERAL" },
      { symbol: "UNH", name: "UnitedHealth", value: 520, change: -0.06, sector: "HEALTHCARE PLANS" },
      { symbol: "PFE", name: "Pfizer", value: 280, change: -1.52, sector: "DRUG MANUFACTURERS-GENERAL" },
      { symbol: "LLY", name: "Eli Lilly", value: 420, change: -1.25, sector: "DRUG MANUFACTURERS-GENERAL" },
      { symbol: "ABBV", name: "AbbVie", value: 300, change: -0.60, sector: "DRUG MANUFACTURERS-GENERAL" }
    ]
  },
  {
    name: "CONSUMER DISCRETIONARY", 
    children: [
      { symbol: "AMZN", name: "Amazon", value: 1500, change: -1.92, sector: "INTERNET RETAIL" },
      { symbol: "HD", name: "Home Depot", value: 350, change: -0.34, sector: "HOME IMPROVEMENT" },
      { symbol: "MCD", name: "McDonald's", value: 200, change: -0.81, sector: "RESTAURANTS" },
      { symbol: "NKE", name: "Nike", value: 150, change: -0.47, sector: "FOOTWEAR" },
      { symbol: "SBUX", name: "Starbucks", value: 120, change: -0.65, sector: "RESTAURANTS" }
    ]
  },
  {
    name: "INDUSTRIALS",
    children: [
      { symbol: "BA", name: "Boeing", value: 130, change: -0.44, sector: "AEROSPACE" },
      { symbol: "CAT", name: "Caterpillar", value: 160, change: -0.72, sector: "FARM & HEAVY" },
      { symbol: "HON", name: "Honeywell", value: 140, change: -0.92, sector: "SPECIALTY INDUSTRIAL" },
      { symbol: "UPS", name: "UPS", value: 110, change: -0.53, sector: "INTEGRATED FREIGHT" }
    ]
  },
  {
    name: "COMMUNICATION SERVICES",
    children: [
      { symbol: "DIS", name: "Disney", value: 180, change: -1.24, sector: "ENTERTAINMENT" },
      { symbol: "CMCSA", name: "Comcast", value: 160, change: -1.74, sector: "TELECOM SERVICES" },
      { symbol: "VZ", name: "Verizon", value: 200, change: -0.85, sector: "TELECOM SERVICES" },
      { symbol: "T", name: "AT&T", value: 140, change: -0.92, sector: "TELECOM SERVICES" }
    ]
  },
  {
    name: "ENERGY",
    children: [
      { symbol: "XOM", name: "Exxon Mobil", value: 480, change: -0.83, sector: "OIL & GAS INTEGRATED" },
      { symbol: "CVX", name: "Chevron", value: 320, change: -0.53, sector: "OIL & GAS INTEGRATED" },
      { symbol: "COP", name: "ConocoPhillips", value: 140, change: -0.44, sector: "OIL & GAS E&P" }
    ]
  },
  {
    name: "CONSUMER STAPLES",
    children: [
      { symbol: "PG", name: "Procter & Gamble", value: 380, change: 0.15, sector: "HOUSEHOLD" },
      { symbol: "KO", name: "Coca-Cola", value: 260, change: -0.20, sector: "BEVERAGES-NON" },
      { symbol: "WMT", name: "Walmart", value: 520, change: -0.52, sector: "DISCOUNT STORES" },
      { symbol: "COST", name: "Costco", value: 280, change: -0.24, sector: "DISCOUNT STORES" }
    ]
  }
];
