const pool = require('../db');

// Change this to 10 * 1000 for 10 seconds (testing)
// Change this to 2 * 60 * 1000 for 2 minutes (production)
const INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

// GET current record based on time
const getCurrentRecord = async (req, res) => {
  try {
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM soil_data');
    const totalRecords = parseInt(countResult.rows[0].count);

    if (totalRecords === 0) {
      return res.status(404).json({ success: false, error: 'No data available' });
    }

    // Calculate current index based on time
    const now = Date.now();
    const intervalsPassed = Math.floor(now / INTERVAL);
    const currentIndex = intervalsPassed % totalRecords;

    // Fetch the specific record
    const result = await pool.query(
      'SELECT * FROM soil_data ORDER BY id LIMIT 1 OFFSET $1',
      [currentIndex]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      meta: {
        currentIndex: currentIndex + 1,
        totalRecords,
        intervalMinutes: INTERVAL / 60000
      }
    });
  } catch (error) {
    console.error('Error fetching current record:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch current record' });
  }
};

module.exports = {
  getCurrentRecord
};
