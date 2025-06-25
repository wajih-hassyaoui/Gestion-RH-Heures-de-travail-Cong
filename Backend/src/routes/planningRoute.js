const express =require('express');
const router=express.Router();
const plannigController = require('../controllers/planningController');

router.post('/addPlanning', plannigController.addPlanning);
router.get('/subjects',plannigController.getSubjects);
router.get('/singlePlan',plannigController.getSinglePlan);
router.get('/allPlan',plannigController.getAllPlans);
router.put('/updateUserPlan/:id',plannigController.modifyUserPlan);
router.get('/confirm/:id',plannigController.planningConfirmation);
module.exports=router;
