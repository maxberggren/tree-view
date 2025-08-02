# Screen Mosaic Visualizer

A dynamic, config-driven treemap visualization tool that can display any dataset with customizable grouping, coloring, and filtering options.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd screen-mosaic-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - The application will be available at `http://localhost:5173` (or another port if 5173 is busy)
   - Look for the URL in the terminal output

## 📁 Key Files

The application is driven by two main configuration files in the project root:

### `data.json` - Your Dataset
Contains the actual data to visualize. This should be a flat JSON array where each object represents one item to display.

**Example structure:**
```json
[
  {
    "id": "BLD-001",
    "name": "Building Alpha",
    "client": "Siemens",
    "temperature": 22.5,
    "comfort": 85,
    "hasZoneAssets": true,
    "size": 1200
  },
  {
    "id": "BLD-002", 
    "name": "Building Beta",
    "client": "Framfab",
    "temperature": 19.8,
    "comfort": 72,
    "hasZoneAssets": false,
    "size": 800
  }
]
```

### `config.json` - Display Configuration
Defines how each field in your data should be processed, displayed, and colored.

**Field Configuration Options:**
```json
{
  "fieldName": {
    "label": "Display Name",           // How the field appears in the UI
    "type": "field_type",             // See types below
    "visible": true,                  // Show in UI controls
    "unit": "°C",                     // Optional unit suffix
    "decimals": 1,                    // Decimal places for numbers
    "colorMode": "mode_type",         // How to color this field
    "colors": { /* color config */ }, // Color definitions
    "bins": [ /* bin config */ ]      // For binned coloring
  }
}
```

## 🎨 Field Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `identifier` | Unique ID field | Building codes, user IDs |
| `text` | Simple text display | Names, descriptions |
| `numeric` | Numbers with formatting | Temperature, scores |
| `percentage` | Numbers displayed as % | Efficiency ratings |
| `boolean` | True/false values | Feature flags, status |
| `categorical` | Discrete categories | Client names, types |

## 🌈 Color Modes

### Gradient Colors
Smooth color transitions for numeric data:
```json
{
  "colorMode": "gradient",
  "colors": {
    "min": {"r": 59, "g": 130, "b": 246},   // Blue for low values
    "max": {"r": 239, "g": 68, "b": 68}     // Red for high values
  }
}
```

### Binned Colors
Discrete color ranges for numeric data:
```json
{
  "colorMode": "bins",
  "bins": [
    {"min": 0, "max": 50, "label": "Low", "color": "#3B82F6", "borderColor": "#1D4ED8"},
    {"min": 50, "max": 80, "label": "Medium", "color": "#F59E0B", "borderColor": "#D97706"},
    {"min": 80, "max": 100, "label": "High", "color": "#EF4444", "borderColor": "#DC2626"}
  ]
}
```

### Boolean Colors
Different colors for true/false values:
```json
{
  "colorMode": "boolean",
  "colors": {
    "true": {"bg": "#10B981", "border": "#059669", "label": "Yes"},
    "false": {"bg": "#6B7280", "border": "#4B5563", "label": "No"}
  }
}
```

### Categorical Colors
Different colors for each category:
```json
{
  "colorMode": "categorical",
  "colors": {
    "Siemens": {"bg": "#3B82F6", "border": "#1D4ED8", "label": "Siemens"},
    "Framfab": {"bg": "#10B981", "border": "#059669", "label": "Framfab"},
    "default": {"bg": "#6B7280", "border": "#4B5563", "label": "Other"}
  }
}
```

## 🎮 Features

### Interactive Controls
- **Group Mode**: Organize data by any configured field
- **Color Mode**: Color items by any field with color configuration
- **Filtering**: Filter to specific groups using checkboxes
- **Auto Cycle**: Automatically cycle through color modes at set intervals

### Real-time Updates
- Data refreshes automatically every second from `data.json`
- Smooth transitions when data changes
- No explicit loading indicators - seamless updates

### Responsive Design
- Works on desktop and mobile devices
- Tooltips follow mouse cursor
- Dynamic text sizing based on card size

## 🔧 Customization Guide

### Adding New Data
1. **Update `data.json`** with your dataset (flat array of objects)
2. **Configure `config.json`** for each field in your data
3. The application will automatically adapt to your data structure

### Example: Adding a New Field
If you add a `priority` field to your data:

1. **Add to data.json:**
   ```json
   {
     "id": "item-1",
     "priority": "high",
     // ... other fields
   }
   ```

2. **Configure in config.json:**
   ```json
   {
     "priority": {
       "label": "Priority Level",
       "type": "categorical",
       "visible": true,
       "colorMode": "categorical",
       "colors": {
         "high": {"bg": "#EF4444", "border": "#DC2626", "label": "High"},
         "medium": {"bg": "#F59E0B", "border": "#D97706", "label": "Medium"},
         "low": {"bg": "#10B981", "border": "#059669", "label": "Low"},
         "default": {"bg": "#6B7280", "border": "#4B5563", "label": "Unknown"}
       }
     }
   }
   ```

### Size Field
The application automatically detects which field to use for sizing the treemap rectangles:
- Looks for fields with `type: "numeric"` 
- Uses the first numeric field found
- Falls back to `"id"` if no numeric fields exist

## 🎯 Best Practices

### Data Structure
- Keep data flat (no nested objects)
- Use consistent field names across all items
- Include a unique identifier field
- Ensure numeric fields are actual numbers, not strings

### Configuration
- Use descriptive labels for better UX
- Choose appropriate color modes for each data type
- Test color combinations for accessibility
- Keep field names simple and consistent

### Performance
- Large datasets (1000+ items) work well
- Real-time updates handle moderate data changes efficiently
- Consider data size if updating very frequently

## 🛠 Development

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📱 Browser Support

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Mobile browsers supported
- Requires JavaScript enabled

## 🎨 UI Components

The application uses a modern dark theme with:
- Tailwind CSS for styling
- Custom scrollbars
- Smooth transitions and animations
- Focus states for accessibility
- Responsive grid layouts

## 🔄 Data Flow

1. **Startup**: Loads `config.json` and `data.json`
2. **Processing**: Applies configuration rules to data
3. **Rendering**: Creates treemap visualization
4. **Updates**: Polls `data.json` every second for changes
5. **Interaction**: User controls modify grouping, coloring, and filtering

---

**Ready to visualize your data?** Update `data.json` and `config.json` with your information and watch your treemap come to life! 🚀