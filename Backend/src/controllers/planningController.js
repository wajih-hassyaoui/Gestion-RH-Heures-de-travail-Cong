
const planningService = require('../services/planningService');

const addPlanning = (req, res) => {
  const userDetails = {
    jour: req.body.EndTime,
    subject: req.body.Subject,
    reason: req.body.Description,
    userId: req.userId,
    role: req.userRole
  }

  planningService.addNewPlanning(userDetails)
    .then(response => { res.status(201).json(response) })
    .catch(err => res.status(400).json({ msg: err.message || "An unexpected error occurred" }));
};

const getSubjects = (req, res) => {

  planningService.getDifferentSubjects()
    .then(subjects => res.status(200).json(subjects))
    .catch(err => { throw err })
}
const getSinglePlan = (req, res) => {
  const userId = req.userId;
  planningService.showPlanning(userId)
    .then(response => { res.status(200).json(response) })
    .catch(err => res.status(400).json({ msg: err.message || "An unexpected error occurred" }));
}

const getAllPlans = (req, res) => {
  const userDetails = {
    userId: req.userId,
    role: req.userRole
  }
  
  planningService.showUserPlanningsToVerify(userDetails)
    .then(response => { res.status(200).json(response) })
    .catch(err => res.status(400).json({ msg: err.message || "An unexpected error occurred" }));
}


const modifyUserPlan=(req,res)=>{
  const userDetails = {
    jour: req.body.EndTime,
    subject: req.body.Subject,
    employeeId:req.params.id,
    userId: req.userId,
    role: req.userRole
  }
 
  planningService.modifyUserPlan(userDetails)
    .then(response => { res.status(201).json(response) })
    .catch(err => res.status(400).json({ msg: err.message || "An unexpected error occurred" }));

}

const planningConfirmation=(req,res)=>{
  let employeeId=req.params.id;

  planningService.confirmPlans(employeeId)
  .then(response => { res.status(201).json(response) })
  .catch(err => res.status(400).json({ msg: err.message || "An unexpected error occurred" }));
}
module.exports = { addPlanning, getSubjects, getSinglePlan, getAllPlans,modifyUserPlan,planningConfirmation}