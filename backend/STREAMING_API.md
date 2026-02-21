# Real-Time Data Streaming API

## 📡 Overview

This API simulates real-time data streaming by cycling through CSV records at fixed time intervals (10 minutes by default).

## ✨ Key Features

- ✅ **Stateless**: No in-memory tracking
- ✅ **Time-based**: Uses current timestamp for calculation
- ✅ **Restart-safe**: Works correctly after server restarts
- ✅ **Infinite cycling**: Automatically loops back to first record
- ✅ **Scalable**: Works with large datasets without loading all data

## 🔧 How It Works

### Algorithm

1. Get total record count from database
2. Calculate intervals passed since Unix epoch: `intervalsPassed = floor(currentTime / intervalDuration)`
3. Calculate current index: `currentIndex = intervalsPassed % totalRecords`
4. Fetch record at that index using `OFFSET`

### Example (5 records, 10-minute intervals)

| Time Range | Intervals Passed | Index (mod 5) | Record |
|------------|------------------|---------------|--------|
| 0-10 min   | 0                | 0             | Row 1  |
| 10-20 min  | 1                | 1             | Row 2  |
| 20-30 min  | 2                | 2             | Row 3  |
| 30-40 min  | 3                | 3             | Row 4  |
| 40-50 min  | 4                | 4             | Row 5  |
| 50-60 min  | 5                | 0             | Row 1  |
| 60-70 min  | 6                | 1             | Row 2  |

## 🚀 API Endpoint

### GET /api/current

Returns the current record based on time-based cycling.

**URL:** `http://localhost:5000/api/current`

**Method:** `GET`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nitrogen": 90,
    "phosphorus": 42,
    "potassium": 43,
    "temperature": "20.80",
    "humidity": "82.00",
    "ph": "6.50",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "meta": {
    "currentIndex": 1,
    "totalRecords": 5,
    "intervalMinutes": 10
  }
}
```

**Error Response (No Data):**

```json
{
  "success": false,
  "error": "No data available"
}
```

## ⚙️ Configuration

### Change Interval Duration

Edit `backend/controllers/streamController.js`:

```javascript
// For testing (10 seconds)
const INTERVAL = 10 * 1000;

// For production (10 minutes)
const INTERVAL = 10 * 60 * 1000;

// For custom duration (e.g., 5 minutes)
const INTERVAL = 5 * 60 * 1000;
```

## 🧪 Testing

### Using Thunder Client / Postman

1. **Create GET Request**
   - Method: `GET`
   - URL: `http://localhost:5000/api/current`

2. **Send Request**
   - Click "Send"
   - Observe the returned record

3. **Test Cycling (Quick Test)**
   - Change `INTERVAL` to `10 * 1000` (10 seconds)
   - Restart server: `npm start`
   - Send request every 10 seconds
   - Verify different records are returned

4. **Test After Restart**
   - Note the current record
   - Stop server (Ctrl+C)
   - Wait 10 seconds (or 10 minutes in production)
   - Restart server
   - Send request again
   - Verify it returns the correct next record (not the same one)

### Using cURL

```bash
curl http://localhost:5000/api/current
```

### Using Browser

Simply open: `http://localhost:5000/api/current`

## 📱 Mobile App Integration

### React Native Example

```javascript
const fetchCurrentData = async () => {
  try {
    const response = await fetch('http://YOUR_SERVER_IP:5000/api/current');
    const result = await response.json();
    
    if (result.success) {
      console.log('Current Record:', result.data);
      console.log('Position:', result.meta.currentIndex, '/', result.meta.totalRecords);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Fetch every minute to get updates
setInterval(fetchCurrentData, 60000);
```

### Flutter Example

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> fetchCurrentData() async {
  try {
    final response = await http.get(
      Uri.parse('http://YOUR_SERVER_IP:5000/api/current'),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print('Current Record: ${data['data']}');
      print('Position: ${data['meta']['currentIndex']}/${data['meta']['totalRecords']}');
    }
  } catch (e) {
    print('Error: $e');
  }
}
```

## 🔍 Verification

### Check if it's working correctly:

1. **Note the time** when you get a specific record
2. **Wait for the interval** (10 minutes or your configured time)
3. **Request again** - you should get the next record
4. **After showing all records**, it should loop back to the first

### Calculate expected record manually:

```javascript
// Get current Unix timestamp in milliseconds
const now = Date.now();

// Calculate intervals passed (assuming 10-minute intervals)
const intervalsPassed = Math.floor(now / (10 * 60 * 1000));

// If you have 100 records
const expectedIndex = intervalsPassed % 100;

console.log('Expected record index:', expectedIndex);
```

## 📊 Performance

- **Database Queries**: 2 per request (COUNT + SELECT)
- **Memory Usage**: Minimal (only one record loaded)
- **Scalability**: Works with millions of records
- **Response Time**: < 50ms typically

## 🛠️ Troubleshooting

**Issue: Same record keeps returning**

- Check if `INTERVAL` is too large
- Verify system time is correct
- Ensure database has multiple records

**Issue: Records not cycling**

- Verify `INTERVAL` constant is set correctly
- Check database connection
- Ensure `soil_data` table has data

**Issue: Wrong record after restart**

- This is expected behavior - the system calculates based on current time
- The record should be correct for the current time interval

## 📝 Technical Notes

- Uses Unix epoch (January 1, 1970) as reference point
- All calculations are deterministic based on current time
- No state stored in memory or database
- Server restarts don't affect cycling logic
- Works across multiple server instances (load balancing safe)

## 🎯 Use Cases

- IoT sensor simulation
- Demo applications
- Testing real-time dashboards
- Training/educational purposes
- Prototype development
