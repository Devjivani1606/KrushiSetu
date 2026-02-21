# Smart Agriculture Backend API

Node.js + Express + PostgreSQL backend for Smart Agriculture application.

## 📦 Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the backend folder:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
```

### 3. Verify Database
Make sure PostgreSQL is running and the `soil_data` table exists with data.

### 4. Start Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on: `http://localhost:5000`

---

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

### 1️⃣ GET All Soil Data
```
GET /api/soil
```

**Query Parameters (Optional):**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 100)
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)

**Example:**
```
GET /api/soil?page=1&limit=50
GET /api/soil?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nitrogen": 90,
      "phosphorus": 42,
      "potassium": 43,
      "temperature": "20.80",
      "humidity": "82.00",
      "ph": "6.50",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 500,
    "limit": 100
  }
}
```

---

### 2️⃣ GET Latest Record
```
GET /api/soil/latest
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 100,
    "nitrogen": 85,
    "phosphorus": 40,
    "potassium": 50,
    "temperature": "22.50",
    "humidity": "75.00",
    "ph": "6.80",
    "created_at": "2024-01-20T14:25:00.000Z"
  }
}
```

---

### 3️⃣ GET Record by ID
```
GET /api/soil/:id
```

**Example:**
```
GET /api/soil/5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "nitrogen": 78,
    "phosphorus": 38,
    "potassium": 45,
    "temperature": "21.00",
    "humidity": "80.00",
    "ph": "6.20",
    "created_at": "2024-01-10T09:15:00.000Z"
  }
}
```

---

### 4️⃣ POST New Record
```
POST /api/soil
Content-Type: application/json
```

**Request Body:**
```json
{
  "nitrogen": 90,
  "phosphorus": 42,
  "potassium": 43,
  "temperature": 20.8,
  "humidity": 82,
  "ph": 6.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "nitrogen": 90,
    "phosphorus": 42,
    "potassium": 43,
    "temperature": "20.80",
    "humidity": "82.00",
    "ph": "6.50",
    "created_at": "2024-01-21T10:00:00.000Z"
  }
}
```

---

### 5️⃣ DELETE Record
```
DELETE /api/soil/:id
```

**Example:**
```
DELETE /api/soil/5
```

**Response:**
```json
{
  "success": true,
  "message": "Record deleted successfully",
  "data": {
    "id": 5,
    "nitrogen": 78,
    "phosphorus": 38,
    "potassium": 45,
    "temperature": "21.00",
    "humidity": "80.00",
    "ph": "6.20",
    "created_at": "2024-01-10T09:15:00.000Z"
  }
}
```

---

## 🧪 Testing with Thunder Client / Postman

### Setup:
1. Install Thunder Client extension in VS Code (or use Postman)
2. Create a new request collection

### Test Examples:

**1. Get All Data:**
- Method: `GET`
- URL: `http://localhost:5000/api/soil`

**2. Get Latest:**
- Method: `GET`
- URL: `http://localhost:5000/api/soil/latest`

**3. Get by ID:**
- Method: `GET`
- URL: `http://localhost:5000/api/soil/1`

**4. Create New Record:**
- Method: `POST`
- URL: `http://localhost:5000/api/soil`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "nitrogen": 95,
  "phosphorus": 45,
  "potassium": 50,
  "temperature": 23.5,
  "humidity": 78,
  "ph": 6.8
}
```

**5. Delete Record:**
- Method: `DELETE`
- URL: `http://localhost:5000/api/soil/1`

---

## 🔗 Connect to React Frontend

In your React app, use fetch or axios:

```javascript
// Example: Fetch all soil data
const fetchSoilData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/soil');
    const result = await response.json();
    console.log(result.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Example: Create new record
const createRecord = async (data) => {
  try {
    const response = await fetch('http://localhost:5000/api/soil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📁 Project Structure

```
backend/
├── server.js                 # Entry point
├── db.js                     # Database connection pool
├── routes/
│   └── soilRoutes.js        # API routes
├── controllers/
│   └── soilController.js    # Business logic
├── .env                      # Environment variables (create this)
├── .env.example              # Environment template
├── package.json              # Dependencies
└── README.md                 # Documentation
```

---

## ✅ Features Included

- ✅ Connection pooling
- ✅ Environment variables
- ✅ CORS enabled
- ✅ Request validation
- ✅ Error handling
- ✅ Async/await
- ✅ Proper status codes
- ✅ Pagination
- ✅ Date filtering
- ✅ Request logging
- ✅ Graceful shutdown

---

## 🐛 Troubleshooting

**Database connection error:**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database and table exist

**Port already in use:**
- Change `PORT` in `.env` file
- Or kill the process using port 5000

**CORS error in React:**
- Backend already has CORS enabled
- Make sure backend is running before frontend

---

## 📝 Notes

- All responses follow `{ success, data/error }` format
- Timestamps are in ISO 8601 format
- Numeric values are returned as strings from PostgreSQL
- IDs are auto-generated (BIGSERIAL)
