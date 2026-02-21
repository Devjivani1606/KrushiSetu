const express = require('express');
const router = express.Router();
const {
  getAllSoilData,
  getLatestSoilData,
  getSoilDataById,
  createSoilData,
  deleteSoilData
} = require('../controllers/soilController');

router.get('/soil', getAllSoilData);
router.get('/soil/latest', getLatestSoilData);
router.get('/soil/:id', getSoilDataById);
router.post('/soil', createSoilData);
router.delete('/soil/:id', deleteSoilData);

module.exports = router;
