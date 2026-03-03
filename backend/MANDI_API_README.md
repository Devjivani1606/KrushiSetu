# Mandi Price API - Backend Documentation

## Overview

The Mandi Price API fetches real-time agricultural commodity prices from the **Agmarknet** dataset via **data.gov.in**. The API key is used **only in the backend** and is never exposed to the frontend.

---

## Setup

### 1. Add API Key to .env

Add your data.gov.in API key to the backend `.env` file:

```
API_KEY=your_generated_api_key_here
```

Get your key from: [data.gov.in](https://data.gov.in) → My Account → API Key

### 2. Optional: Use api.data.gov.in Format

If your API key works with `api.data.gov.in` (user-specified format), add:

```
USE_API_DATA_GOV=true
```

By default, the backend uses India's OGD format: `https://data.gov.in/api/datastore/resource.json`

---

## Folder Structure

```
backend/
├── routes/
│   └── mandiRoutes.js      # GET /api/mandi/latest, GET /api/mandi/history
├── controllers/
│   └── mandiController.js  # Validation, error handling, response formatting
├── services/
│   └── agmarknetService.js  # Agmarknet API calls, filtering, calculations
├── server.js               # Registers mandi routes
└── .env                    # API_KEY (never commit)
```

---

## API Endpoints

### 1. Get Latest Mandi Price

**Route:** `GET /api/mandi/latest`

**Query Parameters:**

| Param  | Type   | Required | Description                    |
|--------|--------|----------|--------------------------------|
| crop   | string | Yes      | Commodity (e.g. Rice, Wheat)   |
| state  | string | Yes      | State (e.g. Maharashtra)       |
| mandi  | string | Yes      | Market/Mandi (e.g. Nagpur)     |

**Example Request:**

```
GET /api/mandi/latest?crop=Rice&state=Maharashtra&mandi=Nagpur
```

**Example Response (200):**

```json
{
  "success": true,
  "message": "Latest mandi price fetched successfully",
  "data": {
    "min_price": 4100,
    "max_price": 4850,
    "modal_price": 4450,
    "arrival_date": "2026-02-28",
    "market": "Nagpur",
    "state": "Maharashtra"
  }
}
```

---

### 2. Get Price History for Graph

**Route:** `GET /api/mandi/history`

**Query Parameters:**

| Param  | Type   | Required | Description                          |
|--------|--------|----------|--------------------------------------|
| crop   | string | Yes      | Commodity                            |
| state  | string | Yes      | State                                |
| mandi  | string | Yes      | Market/Mandi                         |
| range  | string | No       | 7D \| 1M \| 6M \| 1Y (default: 1M)   |

**Example Request:**

```
GET /api/mandi/history?crop=Rice&state=Maharashtra&mandi=Nagpur&range=1M
```

**Example Response (200):**

```json
{
  "success": true,
  "message": "Price history fetched successfully",
  "data": {
    "crop": "Rice",
    "mandi": "Nagpur",
    "trend": "+4.2%",
    "highest_price": 4850,
    "lowest_price": 4100,
    "history": [
      { "date": "2026-01-01", "modal_price": 4200 },
      { "date": "2026-01-10", "modal_price": 4300 },
      { "date": "2026-01-20", "modal_price": 4450 },
      { "date": "2026-01-30", "modal_price": 4850 }
    ]
  }
}
```

---

## Flutter / React Native Consumption

### When to Call Backend

Call the backend **whenever** the user changes:

- **Crop** (dropdown)
- **State** (dropdown)
- **Mandi** (dropdown)
- **Time Range** (7D, 1M, 6M, 1Y)

### Graph Data Flow

1. User selects Crop, State, Mandi, Range
2. Frontend calls: `GET /api/mandi/history?crop=Rice&state=Maharashtra&mandi=Nagpur&range=1M`
3. Backend fetches fresh data from Agmarknet API
4. Backend returns `{ crop, mandi, trend, highest_price, lowest_price, history }`
5. Frontend maps `history` to chart:
   - `history[i].date` → X-axis label
   - `history[i].modal_price` → Y-axis value

### Example Flutter/React Native Fetch

```javascript
// React Native / JavaScript
const fetchPriceHistory = async (crop, state, mandi, range) => {
  const params = new URLSearchParams({ crop, state, mandi, range: range || '1M' });
  const res = await fetch(`${API_BASE_URL}/mandi/history?${params}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
};

// Usage in PriceHistory screen
useEffect(() => {
  fetchPriceHistory(selectedCrop, selectedState, selectedMandi, selectedTimeRange)
    .then(res => {
      setPriceData(res.history.map(h => ({ date: h.date, price: h.modal_price })));
      setHighestPrice(res.highest_price);
      setLowestPrice(res.lowest_price);
      setTrend(res.trend);
    })
    .catch(err => setError(err.message));
}, [selectedCrop, selectedState, selectedMandi, selectedTimeRange]);
```

---

## Error Responses

| Status | Cause                          |
|--------|---------------------------------|
| 400    | Missing/invalid crop, state, mandi, or range |
| 404    | No price data found for filters |
| 429    | Rate limit (60 req/min per IP)    |
| 500    | API key missing or server error  |

---

## API Key Troubleshooting

Agar **API key error** aa raha hai:

1. **Test script chalao:**
   ```bash
   cd backend
   node test-mandi-api.js
   ```

2. **.env check karo:**
   - `API_KEY=your_key` (no spaces around `=`)
   - Key ke around quotes mat use karo
   - Copy-paste ke baad extra spaces remove karo

3. **Key sahi jagah se lo:**
   - https://data.gov.in → Login → My Account → Generate API Key

4. **Agar India format fail kare:** `.env` mein add karo:
   ```
   USE_API_DATA_GOV=true
   ```
   Phir server restart karo.

---

## Security

- **API key** stored only in backend `.env`
- **Never** exposed in API response, frontend, or GitHub
- **Rate limiting**: 60 requests/minute per IP per mandi routes
- **Parameter validation** on all inputs
