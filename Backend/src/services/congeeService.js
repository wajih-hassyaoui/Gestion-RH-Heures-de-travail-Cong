const db = require('../models');
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
        user: process.env.email,
        pass: process.env.pass
    }
});

const mailOptionsConfirmed = (email,day,leaveType) => {
    return {
        from: process.env.email,
        to: email,
        subject: 'leave acceptation',
        text: `you're ${leaveType} on ${day} has been accepted`
    }
};
const mailOptionsRefused = (email,day,leaveType,subject) => {
    return {
        from: process.env.email,
        to: email,
        subject: 'leave refused',
        text: `you're ${leaveType} on ${day} has been refused and setted to ${subject}`
    }
};

const getCongeeRequests = (userDetails) => {
    const { userId, role } = userDetails;
    if (role == 'admin') {
        return db.User.findByPk(userId)
            .then(admin => {
                return db.User.findAll({
                    where: { departmentId: admin.departmentId },
                    include: [{ model: db.Poste }]
                })
                    .then(users => {
                        const listOfManagersAndCollaboRatorsWithoutTeam = users.filter(user => user.roleId == 3 || (user.roleId == 4 && user.teamId == null));
                        return db.Planning.findAll({

                            include: [{ model: db.WorkSubject }]
                        })
                            .then(congeeRequests => {
                                let listOfCongee = [];

                                for (let user of listOfManagersAndCollaboRatorsWithoutTeam) {
                                    const filterUserCongeeRequests = congeeRequests.filter(congee => congee.userId == user.id && !congee.isBlocked && !congee.leaveStatus && congee.congee);

                                    const ModifyFiltredList = filterUserCongeeRequests.map(congee => {
                                        return {
                                            imageName: user.imageName,
                                            fullName: `${user.firstName} ${user.lastName}`,
                                            poste: user.Poste.posteName,
                                            day: congee.jour,
                                            leaveType: congee.WorkSubject.subject,
                                            reason: congee.reason,
                                            congeeId: congee.id,
                                            userId: user.id
                                        }
                                    })
                                    const addUserCongees = ModifyFiltredList.map(congee => {
                                        listOfCongee.push(congee);
                                    })
                                }

                                return listOfCongee;
                            });



                    });
            });
    }
    else if (role == 'manager') {
        return db.User.findByPk(userId)
            .then(manager => {
                return db.User.findAll({
                    where: { teamId: manager.teamId },
                    include: [{ model: db.Poste }]
                })
                    .then(users => {
                        return db.Planning.findAll({

                            include: [{ model: db.WorkSubject }]
                        })
                            .then(congeeRequests => {
                                let listOfCongee = [];

                                for (let user of users) {
                                    const filterUserCongeeRequests = congeeRequests.filter(congee => congee.userId == user.id && !congee.isBlocked && !congee.leaveStatus && congee.congee);

                                    const ModifyFiltredList = filterUserCongeeRequests.map(congee => {
                                        return {
                                            imageName: user.imageName,
                                            fullName: `${user.firstName} ${user.lastName}`,
                                            poste: user.Poste.posteName,
                                            day: congee.jour,
                                            leaveType: congee.WorkSubject.subject,
                                            reason: congee.reason,
                                            congeeId: congee.id,
                                            userId: user.id
                                        }
                                    })
                                    const addUserCongees = ModifyFiltredList.map(congee => {
                                        listOfCongee.push(congee);
                                    })
                                }

                                return listOfCongee;
                            });



                    });
            });
    }
    else throw new Error('Not authorized')
}
const confirmCongee = (userDetails) => {
    const { userId, leaveId } = userDetails;

    return db.Planning.findOne({
        where: {
            id: leaveId,
            userId: userId
        },
        include: [
            { model: db.WorkSubject },
            { model: db.User }
        ]
    })
    .then(leave => {
        const leaveSubject = leave.WorkSubject.subject;
        const leaveDay = leave.jour;
        leave.leaveStatus = true;
        leave.isBlocked = true;
        
        return leave.save()
        .then(() => {
            const userEmail = leave.User.email; 
            transporter.sendMail(mailOptionsConfirmed(userEmail, leaveDay, leaveSubject))
            .then(() => console.log('Email sent successfully'))
            .catch(err => console.log(err));
            return { msg: `${leaveSubject} accepted successfully` };
        })
        .catch(err => {
            throw err;
        });
    });
};
         

const rejectCongee = (userDetails) => {
    const { userId, leaveId,subjectId } = userDetails;
    return db.Planning.findOne({
        where: {
            id: leaveId,
            userId: userId
        }
        , include: [
            { model: db.WorkSubject }
            , { model: db.User }]
    })
        .then(leave => {
            const leaveSubject = leave.WorkSubject.subject;
            const leaveDay = leave.jour;
            leave.leaveStatus = false;
            leave.isBlocked = true;
            leave.subjectId=subjectId;
            leave.congee=false;
            return leave.save()
                .then(() => {
                    return db.WorkSubject.findByPk(subjectId)
                    .then(result=>{
                        const userEmail = leave.User.email;
                         transporter.sendMail(mailOptionsRefused(userEmail,leaveDay,leaveSubject,result.subject))
                        .then(() => console.log('Email sent successfully'))
                        .catch(err => console.log(err));
                          return ({ msg: `${leaveSubject} rejected successfully` })
                    })
                     
                    
                   
                })

                .catch(err => { throw err })
        })
}


module.exports = { getCongeeRequests, confirmCongee,rejectCongee}