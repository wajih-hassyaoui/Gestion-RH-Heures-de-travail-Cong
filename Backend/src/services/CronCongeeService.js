const cron = require('node-cron');
const db = require('../models');
const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
        user: process.env.email,
        pass: process.env.pass
    }
});

const mailOptionsOk = (email) => {
    return {
        from: process.env.email,
        to: email,
        subject: 'fill timeline',
        text: `you have to fill the timeline of your next week for verification `
    }
};
const mailOptionsNotOk = (email) => {
    return {
        from: process.env.email,
        to: email,
        subject: 'fill timeline',
        text: `you have to fill the timeline of the rest days of this month `
    }
};
const mailOptionsNotOkAtAll = (email) => {
    return {
        from: process.env.email,
        to: email,
        subject: 'fill timeline',
        text: `you have to fill the timeline of this week  `
    }
};
function startScheduledTasks() {

    cron.schedule('0 0 1 * *', () => {
        db.User.findAll({ where: { status: true } })
            .then(users => {
                const leaveBalanceAddition = users.map(user => {
                    return db.Poste.findByPk(user.posteId)
                        .then(poste => {
                            if (poste) {
                                user.leaveBalance += poste.leave;
                                return user.save();
                            }
                        });
                });
                return Promise.all(leaveBalanceAddition);
            })
            .catch(err => {
                console.error(err);
            });
    });


    cron.schedule('0 0 1 1 *', () => {
        db.User.findAll({ where: { status: true } })
            .then(users => {
                const sickLeaveBalanceAddition = users.map(user => {
                    return db.Poste.findByPk(user.posteId)
                        .then(poste => {
                            if (poste) {
                                // user.compensatoryTimeOffBalance=0;
                                // user.leaveBalance=0;
                                user.sickLeaveBalance=0;
                                return user.save()
                                .then(userData=>{
                                    userData.sickLeaveBalance += poste.sickLeave;
                                   return userData.save();
                                })
                                
                            }
                        });
                });
                return Promise.all(sickLeaveBalanceAddition);
            })
            .catch(err => {
                console.error(err);
            });
    });

    cron.schedule('0 0 * * *', () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        db.Planning.findAll({
            where: {
                isBlocked: false
            }
        })
            .then(plannings => {
                if (plannings) {
                    let listOfPassedDays = []
                    for (let plan of plannings) {
                        const testDate = new Date(plan.jour);
                        if (testDate <= currentDate) {
                            listOfPassedDays.push(plan)
                        }
                    }
                    const disabableModification = listOfPassedDays.map(planning => {
                        planning.isBlocked = true;
                        return planning.save()
                    });
                    return Promise.all(disabableModification);
                }
                else console.log('NO plannings to modify')
            })
            .catch(err => {
                console.error(err);
            });

            
        const NextYear = year + 1;
        const daysUntilMonday = (8 - currentDate.getDay()) % 7;
        const nextWeekStart = new Date(currentDate);

        nextWeekStart.setDate(currentDate.getDate() + daysUntilMonday);

        const daysOfWeek = [];


        for (let i = 0; i < 5; i++) {
            const nextDay = new Date(nextWeekStart);
            nextDay.setDate(nextWeekStart.getDate() + i);
            const nextDay1 = nextDay.toISOString().split('T')[0];

            daysOfWeek.push(nextDay1);
        }
        db.Campagne.findAll()
            .then(campagnes => {
                const campagne = campagnes.find(camp => camp.year == year);
                if (campagne) {
                    if (campagne.status) {
                        return db.User.findAll({ where: { status: true }, include: [{ model: db.Role }] })
                            .then(allUsers => {
                                const filterUsersByRole = allUsers.filter(user => user.Role.roleName == 'manager' || user.Role.roleName == 'collaborator');
                                return db.Planning.findAll({ where: { campagneId: campagne.id } })
                                    .then(allPlannings => {
                                        if (allPlannings) {
                                            const nextDaysCheck=daysOfWeek.map(day=>{
                                                const checkDay = new Date(day);
                                                  
                                                return {
                                                    nextDayYear:checkDay.getFullYear(),
                                                    nextDay:day,

                                                }                                                                                  
                                            });
                                            const funcCheck=nextDaysCheck.find(yy=>yy.nextDayYear!=year)
                                             
                                            if(!funcCheck){
                                                for (let user of filterUsersByRole) {
                                                    const userPlan = allPlannings.filter(plan => plan.userId == user.id);
                                                    let check = [];
                                                    for (let nextDayplann of daysOfWeek){
                                                        let checkUserPlannings=userPlan.find(uPlan=>uPlan.jour==nextDayplann);
                                                        if(checkUserPlannings){
                                                            check.push(checkUserPlannings.jour)
                                                        }
                                                        }
                                                        if(check.length==daysOfWeek.length){
                                                            console.log('this user is OK')
                                                        }
                                                        else{
                                                            transporter.sendMail(mailOptionsOk(user.email))
                                                            .then(()=>console.log('Email sent successfully'))
                                                            .catch(err=>console.log(err))
                                                        }
                                                }

                                            }
                                            else{
                                                const findNextYearInCampagne=campagnes.find(campagne=>campagne.year==NextYear&&campagne.status)
                                                if(findNextYearInCampagne){
                                                    for (let user of filterUsersByRole) {
                                                        const userPlan = allPlannings.filter(plan => plan.userId == user.id);
                                                        let check = [];
                                                        for (let nextDayplann of daysOfWeek){
                                                            let checkUserPlannings=userPlan.find(uPlan=>uPlan.jour==nextDayplann);
                                                            if(checkUserPlannings){
                                                                check.push(checkUserPlannings.jour)
                                                            }
                                                            }
                                                            if(check.length==daysOfWeek.length){
                                                                console.log('this user is OK')
                                                            }
                                                            else{
                                                                transporter.sendMail(mailOptionsOk(user.email))
                                                                .then(()=>console.log('Email sent successfully'))
                                                                .catch(err=>console.log(err))
                                                            }
                                                    }
                                                }
                                                else{
                                                    const getDaysOfCurrentYear=nextDaysCheck.filter(yyy=>yyy.nextDayYear==year)
                                                    for (let user of filterUsersByRole) {
                                                        const userPlan = allPlannings.filter(plan => plan.userId == user.id);
                                                        let check = [];
                                                        for (let nextDayplann of getDaysOfCurrentYear){
                                                            let checkUserPlannings=userPlan.find(uPlan=>uPlan.jour==nextDayplann);
                                                            if(checkUserPlannings){
                                                                check.push(checkUserPlannings.jour)
                                                            }
                                                            }
                                                            if(check.length==daysOfWeek.length){
                                                                console.log('this user is OK')
                                                            }
                                                            else{
                                                                transporter.sendMail(mailOptionsNotOk(user.email))
                                                                .then(()=>console.log('Email sent successfully'))
                                                                .catch(err=>console.log(err))
                                                            }
                                                    }
                                                }
                                                
                                            }                                           
                                        }
                                        else {
                                            const sendMails=filterUsersByRole.map(user=>{
                                                return transporter.sendMail(mailOptionsNotOkAtAll(user.email))
                                            })
                                            Promise.all(sendMails)
                                        }
                                    })

                            })
                    }
                    else console.log('campagne not active')
                }
                else console.log('campagne not created yet ')



            })

    });


}

module.exports = { startScheduledTasks };
