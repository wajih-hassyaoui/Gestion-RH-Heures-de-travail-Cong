const express = require('express')
const router = express.Router();
const congeeController = require('../controllers/congeeController');

router.get('/', congeeController.getAllCongeeRequest);
router.put('/confirm/:id',congeeController.confirmCongee);
router.put('/reject/:id',congeeController.rejectCongee);

module.exports=router;


