const congeeService =require('../services/congeeService');

const getAllCongeeRequest = (req, res) => {
    const userDetails={
        role:req.userRole,
        userId:req.userId
    }
    congeeService.getCongeeRequests(userDetails)
        .then(data => { res.status(200).json(data)})
        .catch(err => res.status(400).json({ msg: err.message || "An unexpected error occurred" }))
}
const confirmCongee=(req,res)=>{
    const userDetails={
        leaveId:req.params.id,
        userId:req.body.userId   }
        
    congeeService.confirmCongee(userDetails)
        .then(data => { res.status(201).json(data)})
        .catch(err => { res.status(400).json({ msg: err.message || "An unexpected error occurred" })})
}

const rejectCongee=(req,res)=>{
    const userDetails={
        leaveId:req.params.id,
        userId:req.body.userId,
        subjectId:req.body.leaveSubId
    }
    congeeService.rejectCongee(userDetails)
        .then(data => { res.status(200).json(data)})
        .catch(err => res.status(400).json({ msg: err.message || "An unexpected error occurred" }))
}



module.exports={getAllCongeeRequest,rejectCongee,confirmCongee}