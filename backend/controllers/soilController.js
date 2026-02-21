const pool = require('../db');

// GET all soil data with pagination
const getAllSoilData = async (req, res) => {
  try {
    const { page = 1, limit = 100, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM soil_data';
    let countQuery = 'SELECT COUNT(*) FROM soil_data';
    const queryParams = [];
    let paramIndex = 1;

    // Date filtering
    if (startDate || endDate) {
      query += ' WHERE';
      countQuery += ' WHERE';
      
      if (startDate) {
        query += ` created_at >= $${paramIndex}`;
        countQuery += ` created_at >= $${paramIndex}`;
        queryParams.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        if (startDate) {
          query += ' AND';
          countQuery += ' AND';
        }
        query += ` created_at <= $${paramIndex}`;
        countQuery += ` created_at <= $${paramIndex}`;
        queryParams.push(endDate);
        paramIndex++;
      }
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalRecords = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching soil data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch soil data' });
  }
};

// GET latest soil record
const getLatestSoilData = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM soil_data ORDER BY created_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No data found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching latest soil data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest data' });
  }
};

// GET soil data by ID
const getSoilDataById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }

    const result = await pool.query('SELECT * FROM soil_data WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching soil data by ID:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
};

// POST new soil data
const createSoilData = async (req, res) => {
  try {
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph } = req.body;

    // Validation
    if (
      nitrogen === undefined || phosphorus === undefined || potassium === undefined ||
      temperature === undefined || humidity === undefined || ph === undefined
    ) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required: nitrogen, phosphorus, potassium, temperature, humidity, ph' 
      });
    }

    if (nitrogen < 0 || phosphorus < 0 || potassium < 0) {
      return res.status(400).json({ success: false, error: 'NPK values must be non-negative' });
    }

    if (temperature < -50 || temperature > 100) {
      return res.status(400).json({ success: false, error: 'Temperature must be between -50 and 100' });
    }

    if (humidity < 0 || humidity > 100) {
      return res.status(400).json({ success: false, error: 'Humidity must be between 0 and 100' });
    }

    if (ph < 0 || ph > 14) {
      return res.status(400).json({ success: false, error: 'pH must be between 0 and 14' });
    }

    const result = await pool.query(
      `INSERT INTO soil_data (nitrogen, phosphorus, potassium, temperature, humidity, ph) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nitrogen, phosphorus, potassium, temperature, humidity, ph]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating soil data:', error);
    res.status(500).json({ success: false, error: 'Failed to create soil data' });
  }
};

// DELETE soil data by ID
const deleteSoilData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }

    const result = await pool.query('DELETE FROM soil_data WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    res.json({ success: true, message: 'Record deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting soil data:', error);
    res.status(500).json({ success: false, error: 'Failed to delete data' });
  }
};

module.exports = {
  getAllSoilData,
  getLatestSoilData,
  getSoilDataById,
  createSoilData,
  deleteSoilData
};
