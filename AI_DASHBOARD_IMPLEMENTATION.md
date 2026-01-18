# AI Dashboard - Anomaly Detection Implementation

## Overview
A complete AI Dashboard with anomaly detection features has been created for the SustainOlive frontend application. The dashboard is accessible via the menu and provides real-time monitoring of sensor anomalies.

## New Files Created

### 1. Main Page Component
- **File**: [src/pages/AnomalyDetectionPage.tsx](src/pages/AnomalyDetectionPage.tsx)
- **Description**: Main container for the AI dashboard with anomaly detection
- **Features**:
  - Mock data generation (288 data points representing 24 hours)
  - Statistics calculation (min, max, avg, status)
  - Anomaly data generation (5% anomaly rate)
  - State management for device, feature, and time range selection

### 2. Sub-Components (in src/components/AnomalyDetection/)

#### ControlPanel
- **File**: [src/components/AnomalyDetection/ControlPanel.tsx](src/components/AnomalyDetection/ControlPanel.tsx)
- **Description**: Control panel with dropdown selectors
- **Features**:
  - Device selector (mock data for 3 devices)
  - Feature selector (Temperature, Humidity, Soil Moisture, Light Intensity)
  - Time range selector (1h, 6h, 24h, 7d, 30d)
  - TODO: Backend API integration for fetching real devices and features

#### SummaryCards
- **File**: [src/components/AnomalyDetection/SummaryCards.tsx](src/components/AnomalyDetection/SummaryCards.tsx)
- **Description**: Displays key metrics at a glance
- **Cards**:
  - **Current Status**: Shows "Normal" or "Critical" with icon and color coding
  - **Anomalies (Last 24h)**: Total count of detected anomalies
  - **Current Value**: Current sensor reading with unit
  - **Value Range**: Min, Max, and Average values over the selected period
- **Styling**: Color-coded cards with left border indicators

#### AnomalyChart
- **File**: [src/components/AnomalyDetection/AnomalyChart.tsx](src/components/AnomalyDetection/AnomalyChart.tsx)
- **Description**: Main visualization with line chart and anomaly markers
- **Features**:
  - Line chart showing sensor data trend in blue
  - Red scatter points overlaid on chart to highlight anomalies
  - Interactive tooltips showing exact value and timestamp
  - Legend and grid
  - Responsive container that adapts to screen size
  - Information box explaining the chart
- **Height**: 400px responsive chart

#### AnomalyLog
- **File**: [src/components/AnomalyDetection/AnomalyLog.tsx](src/components/AnomalyDetection/AnomalyLog.tsx)
- **Description**: Data table of detected anomalies
- **Columns**:
  - Timestamp (sortable)
  - Feature (filterable)
  - Value (sortable)
  - Severity (filterable, color-coded: red for high, orange for medium, yellow for low)
  - Description
  - Actions (export and delete/review buttons)
- **Features**:
  - Pagination (10, 20, 50 items per page)
  - Multiple sorting and filtering options
  - Export and Clear All buttons with TODO backend integration
  - Empty state handling

## Updated Files

### App.tsx
- Added import for `AnomalyDetectionPage`
- Added new route: `/ai-dashboard` with `PrivateRoute` protection

### Menu.tsx
- Added `ThunderboltOutlined` icon import
- Added "AI Dashboard" menu item with lightning bolt icon
- Menu item navigates to `/ai-dashboard`

## Mock Data Structure

### DataPoint Interface
```typescript
interface DataPoint {
  timestamp: number;
  value: number;
  isAnomaly: boolean;
}
```

### Anomaly Interface
```typescript
interface Anomaly {
  id: string;
  timestamp: number;
  value: number;
  feature: string;
  severity: "low" | "medium" | "high";
  description: string;
}
```

## Features & Functionality

### ✅ Implemented
- Control panel with device, feature, and time range selection
- Summary cards showing status, anomaly count, current value, and statistics
- Interactive line chart with anomaly overlay
- Anomalous data points marked as red dots on the chart
- Hover tooltips with timestamp and value information
- Anomaly log table with sorting, filtering, and pagination
- Responsive design that works on different screen sizes
- Professional styling with Ant Design components
- Mock data generation for 24-hour period with 5% anomaly rate

### 📝 TODO: Backend Integration Tasks
1. **ControlPanel**:
   - Fetch devices from backend API
   - Fetch features based on selected device from backend API

2. **AnomalyDetectionPage**:
   - Replace mock data with real sensor data from backend
   - Fetch historical data based on selected time range
   - Fetch anomalies from backend anomaly detection service

3. **AnomalyLog**:
   - Implement "Export" functionality to export anomalies to CSV
   - Implement "Clear All" to mark all anomalies as reviewed
   - Implement individual "Delete/Review" action

4. **General**:
   - Add real-time updates via WebSocket or polling
   - Implement pagination on backend
   - Add sorting and filtering on backend for better performance

## Navigation
Users can access the AI Dashboard through:
1. Clicking the "AI Dashboard" menu item in the left sidebar (⚡ icon)
2. Direct URL: `/ai-dashboard` (requires authentication via `PrivateRoute`)

## Styling Notes
- Uses Ant Design components for consistency
- Color scheme:
  - Blue (#1890ff): Normal data and trends
  - Red (#ff4d4f): Anomalies and critical status
  - Green (#52c41a): Normal status
  - Yellow/Orange (#faad14, #ff7a45): Warnings and information
  - Purple (#722ed1): Statistics and ranges

## Dependencies Used
- React & React Hooks (useState, useMemo)
- React Router (useNavigate)
- Ant Design (Card, Select, Row, Col, Statistic, Table, Button, etc.)
- Recharts (ComposedChart, Line, Scatter, XAxis, YAxis, etc.)
- Ant Design Icons
