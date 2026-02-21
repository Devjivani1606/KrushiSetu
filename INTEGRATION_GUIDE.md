# Frontend-Backend Integration Guide

## Setup Complete ✅

The frontend is now connected to your backend API that updates every 2 minutes.

## What Was Implemented

### 1. API Service (`src/services/api.ts`)
- Fetches current soil data from `/api/current` endpoint
- TypeScript interfaces for type safety

### 2. Updated Screens
All screens now display real-time data:
- **HomeDashboard.tsx** - Main dashboard with NPK and soil parameters
- **SensorDetails.tsx** - Detailed sensor view
- **DashboardScreen.tsx** - Alternative dashboard view

### 3. Features Added
- ✅ Auto-refresh every 2 minutes
- ✅ Manual refresh button on each screen
- ✅ Loading indicators
- ✅ Error handling
- ✅ Last sync timestamp

## Configuration

### API Base URL (`src/config/api.config.ts`)

Change based on your environment:

```typescript
// Android Emulator
BASE_URL: 'http://10.0.2.2:5000/api'

// iOS Simulator
BASE_URL: 'http://localhost:5000/api'

// Physical Device (replace with your computer's IP)
BASE_URL: 'http://192.168.1.100:5000/api'
```

## How to Run

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Start Frontend
```bash
npm start
```

### 3. Run on Device
```bash
# Android
npm run android

# iOS
npm run ios
```

## Data Flow

1. Backend reads CSV data from PostgreSQL
2. `/api/current` endpoint returns data based on 2-minute intervals
3. Frontend fetches data on mount and every 2 minutes
4. User can manually refresh using the refresh button
5. Data displays: Nitrogen, Phosphorus, Potassium, Temperature, Humidity, pH

## Troubleshooting

### Cannot connect to backend
- Check if backend is running on port 5000
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, ensure device and computer are on same network
- Update `src/config/api.config.ts` with correct IP

### Data not updating
- Check backend console for errors
- Verify PostgreSQL database has data
- Check network tab in React Native debugger

## Notes

- Humidity is used as Moisture value (as per your requirement)
- Auto-refresh interval: 2 minutes (120,000 ms)
- Backend interval: 2 minutes (configurable in `streamController.js`)
