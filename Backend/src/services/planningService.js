const db = require('../models');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
        user: process.env.email,
        pass: process.env.pass
    }
});

const mailOptions = (email, day, type) => {
    return {
        from: process.env.email,
        to: email,
        subject: 'plan update',
        text: `your plan on this day ${day} is modified to be ${type} and confirmed.`
    }
};



const getDifferentSubjects = () => {
    return db.WorkSubject.findAll()
        .then(subjects => {
            const subjectList = subjects.map(subj => {
                return {
                    subject: subj.subject
                }
            })
            return subjectList;
        })
}

const getSubjectsForHighRoles = () => {
    return db.WorkSubject.findAll()
        .then(subjects => {
            const filterSubjects = subjects.filter(sub => sub.id == 1 || sub.id == 2)
            const subjectList = filterSubjects.map(subj => {
                return {
                    subject: subj.subject
                }
            })
            return subjectList;
        })
}


const addNewPlanning = (planDetails) => {


    let day = new Date(planDetails.jour);
    const currentDate = new Date();
    if (day == currentDate) {
        throw new Error("you cant change your current date")
    }
    else if (day < currentDate) {
        throw new Error("Day passed ")
    }

    else {
        return db.WorkSubject.findAll()
            .then(subjects => {
                const findSubject = subjects.find(item => item.subject == planDetails.subject);
                if (findSubject) {
                    let subId = findSubject.id

                    if (subId == 1 || subId == 2) {
                        const formattedDate = day.toISOString().split('T')[0];
                        const month = day.getMonth() + 1;
                        const year = day.getFullYear();
                        const currentYear = currentDate.getFullYear();
                        return db.Month.findOne({
                            where: {
                                monthOrder: month
                            }
                        })
                            .then(mois => {
                                if (mois) {
                                    const monthId = mois.id;
                                    const jour = formattedDate;
                                    return db.Campagne.findAll()
                                        .then(years => {
                                            const checkexisting = years.find(item => item.year == year)
                                            let annee = years.find(item => item.year == year && item.status)

                                            const listOfactiveYears = years.filter(item => item.status)
                                            const listOfYears = listOfactiveYears.map(item => item.year)
                                            const listOfactiveYearsBiggerThanCurrentYear = listOfYears.filter(item => item >= currentYear);
                                            const isYearAddedNotInCurentYear = listOfactiveYearsBiggerThanCurrentYear.find(item => item == year)
                                            const maxActiveYear = Math.max(...listOfYears);

                                            if (checkexisting) {
                                                if (annee) {

                                                    if ((currentYear == maxActiveYear) && (maxActiveYear == annee.year)) {
                                                        return db.Planning.findOne({
                                                            where: {
                                                                userId: planDetails.userId,
                                                                jour: jour
                                                            }
                                                        })
                                                            .then(existingPlanning => {

                                                                if (existingPlanning) {

                                                                    if (existingPlanning.isBlocked) {
                                                                        throw new Error('you cant modify this day because its confirmed or passed')
                                                                    }
                                                                    else {
                                                                        const workSubjects = subjects.filter(subject => subject.id == 1 || subject.id == 2);
                                                                        const leaveSubjects = subjects.filter(subject => subject.id != 1 && subject.id != 2);
                                                                        const isExistingPlanningLeave = leaveSubjects.find(item => item.id == existingPlanning.subjectId);
                                                                        const isExistingPlanningWork = workSubjects.find(item => item.id == existingPlanning.subjectId);
                                                                        if (isExistingPlanningLeave) {
                                                                            if (existingPlanning.subjectId == 3) {
                                                                                return db.User.findByPk(planDetails.userId)
                                                                                    .then(user => {
                                                                                        user.leaveBalance = user.leaveBalance + 1;
                                                                                        existingPlanning.subjectId = subId;
                                                                                        existingPlanning.reason = null;
                                                                                        existingPlanning.congee = false;
                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                            .then(update => {
                                                                                                return {
                                                                                                    msg: "day updated successfully",
                                                                                                    dayAndUser: update
                                                                                                }
                                                                                            })
                                                                                    })
                                                                            }
                                                                            else if (existingPlanning.subjectId == 4) {
                                                                                return db.User.findByPk(planDetails.userId)
                                                                                    .then(user => {
                                                                                        user.leaveBalance = user.sickLeaveBalance + 1;
                                                                                        existingPlanning.subjectId = subId;
                                                                                        existingPlanning.reason = null;
                                                                                        existingPlanning.congee = false;
                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                            .then(update => {
                                                                                                return {
                                                                                                    msg: "day updated successfully",
                                                                                                    dayAndUser: update
                                                                                                }
                                                                                            })
                                                                                    })
                                                                            }
                                                                            else {
                                                                                return db.User.findByPk(planDetails.userId)
                                                                                    .then(user => {
                                                                                        user.leaveBalance = user.compensatoryTimeOffBalance + 1;
                                                                                        existingPlanning.subjectId = subId;
                                                                                        existingPlanning.reason = null;
                                                                                        existingPlanning.congee = false;
                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                            .then(update => {
                                                                                                return {
                                                                                                    msg: "day updated successfully",
                                                                                                    dayAndUser: update
                                                                                                }
                                                                                            })
                                                                                    })
                                                                            }
                                                                        }
                                                                        else if (isExistingPlanningWork) {
                                                                            existingPlanning.subjectId = subId;
                                                                            return existingPlanning.save()
                                                                                .then(update => {
                                                                                    return {
                                                                                        msg: "day updated successfully",
                                                                                        day: update
                                                                                    }
                                                                                })
                                                                        }
                                                                        else throw new Error('an error')
                                                                    }
                                                                }
                                                                else {

                                                                    const campagneId = annee.id;

                                                                    return db.Planning.create({
                                                                        jour: jour,
                                                                        campagneId: campagneId,
                                                                        userId: planDetails.userId,
                                                                        subjectId: subId,
                                                                        monthId: monthId,
                                                                        congee: false

                                                                    })
                                                                        .then(result => ({ msg: "planning added successfully", plan: result }))
                                                                        .catch(err => { throw err })

                                                                }
                                                            })
                                                    }
                                                    else if ((currentYear != maxActiveYear) && isYearAddedNotInCurentYear) {

                                                        return db.Planning.findOne({
                                                            where: {
                                                                userId: planDetails.userId,
                                                                jour: jour
                                                            }
                                                        })
                                                            .then(existingPlanning => {

                                                                if (existingPlanning) {
                                                                    if (existingPlanning.isBlocked) {
                                                                        throw new Error('you cant modify this day because its confirmed or passed')
                                                                    }

                                                                    else {
                                                                        const workSubjects = subjects.filter(subject => subject.id == 1 || subject.id == 2);

                                                                        const leaveSubjects = subjects.filter(subject => subject.id != 1 && subject.id != 2);

                                                                        const isExistingPlanningLeave = leaveSubjects.find(item => item.id == existingPlanning.subjectId);

                                                                        const isExistingPlanningWork = workSubjects.find(item => item.id == existingPlanning.subjectId);

                                                                        if (isExistingPlanningLeave) {
                                                                            if (existingPlanning.subjectId == 3) {
                                                                                return db.User.findByPk(planDetails.userId)
                                                                                    .then(user => {
                                                                                        user.leaveBalance = user.leaveBalance + 1;
                                                                                        existingPlanning.subjectId = subId;
                                                                                        existingPlanning.reason = null;
                                                                                        existingPlanning.congee = false;
                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                            .then(update => {
                                                                                                return {
                                                                                                    msg: "day updated successfully",
                                                                                                    dayAndUser: update
                                                                                                }
                                                                                            })
                                                                                    })
                                                                            }
                                                                            else if (existingPlanning.subjectId == 4) {
                                                                                return db.User.findByPk(planDetails.userId)
                                                                                    .then(user => {
                                                                                        user.leaveBalance = user.sickLeaveBalance + 1;
                                                                                        existingPlanning.subjectId = subId;
                                                                                        existingPlanning.reason = null;
                                                                                        existingPlanning.congee = false;
                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                            .then(update => {
                                                                                                return {
                                                                                                    msg: "day updated successfully",
                                                                                                    dayAndUser: update
                                                                                                }
                                                                                            })
                                                                                    })
                                                                            }
                                                                            else {
                                                                                return db.User.findByPk(planDetails.userId)
                                                                                    .then(user => {
                                                                                        user.leaveBalance = user.compensatoryTimeOffBalance + 1;
                                                                                        existingPlanning.subjectId = subId;
                                                                                        existingPlanning.reason = null;
                                                                                        existingPlanning.congee = false;
                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                            .then(update => {
                                                                                                return {
                                                                                                    msg: "day updated successfully",
                                                                                                    dayAndUser: update
                                                                                                }
                                                                                            })
                                                                                    })
                                                                            }
                                                                        }
                                                                        else if (isExistingPlanningWork) {
                                                                            existingPlanning.subjectId = subId;
                                                                            return existingPlanning.save()
                                                                                .then(update => {
                                                                                    return {
                                                                                        msg: "day updated successfully",
                                                                                        day: update
                                                                                    }
                                                                                })
                                                                        }
                                                                        else throw new Error('Error')
                                                                    }
                                                                }
                                                                else {

                                                                    const campagneId = annee.id;

                                                                    return db.Planning.create({
                                                                        jour: jour,
                                                                        campagneId: campagneId,
                                                                        userId: planDetails.userId,
                                                                        subjectId: subId,
                                                                        monthId: monthId,
                                                                        congee: false

                                                                    })
                                                                        .then(result => ({ msg: "plan added successfully", plan: result }))
                                                                        .catch(err => {

                                                                            throw err
                                                                        })

                                                                }
                                                            })
                                                    }
                                                    else {
                                                        throw new Error('Campagne not active')
                                                    }

                                                }
                                                else throw new Error("Campagne not active")
                                            }
                                            else throw new Error("Campagne is not existing yet")
                                        })
                                }
                                else throw new Error("no month error")
                            })


                    }

                    else {
                        const formattedDate = day.toISOString().split('T')[0];
                        const month = day.getMonth() + 1;
                        const year = day.getFullYear();
                        const currentYear = currentDate.getFullYear();
                        return db.Month.findOne({
                            where: {
                                monthOrder: month
                            }
                        })
                            .then(mois => {
                                if (mois) {
                                    const monthId = mois.id;
                                    const jour = formattedDate;
                                    return db.Campagne.findAll()
                                        .then(years => {
                                            let annee = years.find(item => item.year == year && item.status)

                                            if (annee) {

                                                if (annee.year == currentYear) {
                                                    const campagneId = annee.id;
                                                    if (planDetails.reason) {
                                                        if (subId == 3) {
                                                            return db.User.findByPk(planDetails.userId)
                                                                .then(user => {
                                                                    if (user.leaveBalance > 1) {
                                                                        return db.Planning.findOne({
                                                                            where: {
                                                                                userId: planDetails.userId,
                                                                                jour: formattedDate
                                                                            }
                                                                        })
                                                                            .then(existingPlanning => {
                                                                                if (existingPlanning) {
                                                                                    if (existingPlanning.isBlocked) {
                                                                                        throw new Error('you cant modify this day because its confirmed or passed')
                                                                                    }
                                                                                    else {
                                                                                        const workSubjects = subjects.filter(subject => subject.id == 1 || subject.id == 2);
                                                                                        const leaveSubjects = subjects.filter(subject => subject.id != 1 || subject.id != 2);
                                                                                        const isExistingPlanningLeave = leaveSubjects.find(item => item.id == existingPlanning.subjectId);
                                                                                        const isExistingPlanningWork = workSubjects.find(item => item.id == existingPlanning.subjectId);
                                                                                        if (isExistingPlanningLeave) {
                                                                                            if (existingPlanning.subjectId == 3) {
                                                                                                return { msg: "it's already saved as leave Request" }
                                                                                            }
                                                                                            else if (existingPlanning.subjectId == 4) {
                                                                                                return db.User.findByPk(planDetails.userId)
                                                                                                    .then(user => {
                                                                                                        user.sickLeaveBalance = user.sickLeaveBalance + 1;
                                                                                                        user.leaveBalance = user.leaveBalance - 1;
                                                                                                        existingPlanning.subjectId = subId;
                                                                                                        existingPlanning.reason = planDetails.reason;
                                                                                                        existingPlanning.congee = true;
                                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                                            .then(update => {
                                                                                                                return {
                                                                                                                    msg: "day updated successfully",
                                                                                                                    dayAndUser: update
                                                                                                                }
                                                                                                            })
                                                                                                    })
                                                                                            }
                                                                                            else {
                                                                                                return db.User.findByPk(planDetails.userId)
                                                                                                    .then(user => {
                                                                                                        user.compensatoryTimeOffBalance = user.compensatoryTimeOffBalance + 1;
                                                                                                        user.leaveBalance = user.leaveBalance - 1;
                                                                                                        existingPlanning.subjectId = subId;
                                                                                                        existingPlanning.reason = planDetails.reason;
                                                                                                        existingPlanning.congee = true;
                                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                                            .then(update => {
                                                                                                                return {
                                                                                                                    msg: "day updated successfully",
                                                                                                                    dayAndUser: update
                                                                                                                }
                                                                                                            })
                                                                                                    })
                                                                                            }
                                                                                        }
                                                                                        else if (isExistingPlanningWork) {
                                                                                            return db.User.findByPk(planDetails.userId)
                                                                                                .then(user => {
                                                                                                    if (!existingPlanning.leaveStatus) {
                                                                                                        throw new Error("you can't add a leave on this date because it was rejected")
                                                                                                    }
                                                                                                    else {
                                                                                                        user.leaveBalance = user.leaveBalance - 1;
                                                                                                        existingPlanning.subjectId = subId;
                                                                                                        existingPlanning.reason = planDetails.reason;
                                                                                                        existingPlanning.congee = true;
                                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                                            .then(update => {
                                                                                                                return {
                                                                                                                    msg: "day updated successfully",
                                                                                                                    dayAndUser: update
                                                                                                                }
                                                                                                            })
                                                                                                    }

                                                                                                })

                                                                                        }
                                                                                        else throw new Error('error')
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    user.leaveBalance = user.leaveBalance - 1;
                                                                                    return user.save()
                                                                                        .then(user => {
                                                                                            return db.Planning.create({
                                                                                                jour: jour,
                                                                                                campagneId: campagneId,
                                                                                                userId: planDetails.userId,
                                                                                                subjectId: subId,
                                                                                                monthId: monthId,
                                                                                                congee: true,
                                                                                                reason: planDetails.reason

                                                                                            })
                                                                                                .then(result => ({ msg: "congee added successfully", plan: result, userConcerned: user }))
                                                                                                .catch(err => { throw err })
                                                                                        })
                                                                                        .catch(err => { throw err })
                                                                                }
                                                                            })
                                                                    }
                                                                    else throw new Error('you dont have leaveBalance ')
                                                                })
                                                                .catch(err => { throw err })
                                                        }
                                                        else if (subId == 4) {
                                                            return db.User.findByPk(planDetails.userId)
                                                                .then(user => {
                                                                    if (user.sickLeaveBalance > 1) {
                                                                        return db.Planning.findOne({
                                                                            where: {
                                                                                userId: planDetails.userId,
                                                                                jour: formattedDate
                                                                            }
                                                                        })
                                                                            .then(existingPlanning => {
                                                                                if (existingPlanning) {
                                                                                    if (existingPlanning.isBlocked) {
                                                                                        throw new Error('you cant modify this day because its confirmed or passed')
                                                                                    }
                                                                                    else {
                                                                                        const workSubjects = subjects.filter(subject => subject.id == 1 || subject.id == 2);
                                                                                        const leaveSubjects = subjects.filter(subject => subject.id != 1 || subject.id != 2);
                                                                                        const isExistingPlanningLeave = leaveSubjects.find(item => item.id == existingPlanning.subjectId);
                                                                                        const isExistingPlanningWork = workSubjects.find(item => item.id == existingPlanning.subjectId);
                                                                                        if (isExistingPlanningLeave) {
                                                                                            if (existingPlanning.subjectId == 3) {
                                                                                                return db.User.findByPk(planDetails.userId)
                                                                                                    .then(user => {
                                                                                                        user.leaveBalance = user.leaveBalance + 1;
                                                                                                        user.sickleaveBalance = user.sickLeaveBalance - 1;
                                                                                                        existingPlanning.subjectId = subId;
                                                                                                        existingPlanning.reason = planDetails.reason;
                                                                                                        existingPlanning.congee = true;
                                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                                            .then(update => {
                                                                                                                return {
                                                                                                                    msg: "day updated successfully",
                                                                                                                    dayAndUser: update
                                                                                                                }
                                                                                                            })
                                                                                                    })

                                                                                            }
                                                                                            else if (existingPlanning.subjectId == 4) {
                                                                                                return { msg: "it's already saved as sick leave Request" }
                                                                                            }
                                                                                            else {
                                                                                                return db.User.findByPk(planDetails.userId)
                                                                                                    .then(user => {
                                                                                                        user.compensatoryTimeOffBalance = user.compensatoryTimeOffBalance + 1;
                                                                                                        user.sickLeaveBalance = user.sickLeaveBalance - 1;
                                                                                                        existingPlanning.subjectId = subId;
                                                                                                        existingPlanning.reason = planDetails.reason;
                                                                                                        existingPlanning.congee = true;
                                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                                            .then(update => {
                                                                                                                return {
                                                                                                                    msg: "day updated successfully",
                                                                                                                    dayAndUser: update
                                                                                                                }
                                                                                                            })
                                                                                                    })
                                                                                            }
                                                                                        }
                                                                                        else if (isExistingPlanningWork) {
                                                                                            return db.User.findByPk(planDetails.userId)
                                                                                                .then(user => {
                                                                                                    if (!existingPlanning.leaveStatus) {
                                                                                                        throw new Error("you can't add a sickleave on this date because it was rejected")
                                                                                                    }
                                                                                                    else {
                                                                                                        user.sickLeaveBalance = user.sickLeaveBalance - 1;
                                                                                                        existingPlanning.subjectId = subId;
                                                                                                        existingPlanning.reason = planDetails.reason;
                                                                                                        existingPlanning.congee = true;
                                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                                            .then(update => {
                                                                                                                return {
                                                                                                                    msg: "day updated successfully",
                                                                                                                    dayAndUser: update
                                                                                                                }
                                                                                                            })
                                                                                                    }

                                                                                                })

                                                                                        }
                                                                                        else throw new Error('error')
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    user.sickLeaveBalance = user.sickLeaveBalance - 1;
                                                                                    return user.save()
                                                                                        .then(user => {
                                                                                            return db.Planning.create({
                                                                                                jour: jour,
                                                                                                campagneId: campagneId,
                                                                                                userId: planDetails.userId,
                                                                                                subjectId: subId,
                                                                                                monthId: monthId,
                                                                                                congee: true,
                                                                                                reason: planDetails.reason

                                                                                            })
                                                                                                .then(result => ({ msg: "congee added successfully", plan: result, userConcerned: user }))
                                                                                                .catch(err => { throw err })
                                                                                        })
                                                                                        .catch(err => { throw err })
                                                                                }
                                                                            })
                                                                            .catch(err => { throw err })

                                                                    }
                                                                    else throw new Error('you dont have sickLeaveBalance ')
                                                                })
                                                                .catch(err => { throw err })
                                                        }
                                                        else if (subId == 5) {
                                                            return db.User.findByPk(planDetails.userId)
                                                                .then(user => {
                                                                    if (user.compensatoryTimeOffBalance > 1) {
                                                                        return db.Planning.findOne({
                                                                            where: {
                                                                                userId: planDetails.userId,
                                                                                jour: formattedDate
                                                                            }
                                                                        })
                                                                            .then(existingPlanning => {
                                                                                if (existingPlanning) {
                                                                                    if (existingPlanning.isBlocked) {
                                                                                        throw new Error('you cant modify this day because its confirmed or passed')
                                                                                    }
                                                                                    else {
                                                                                        const workSubjects = subjects.filter(subject => subject.id == 1 || subject.id == 2);
                                                                                        const leaveSubjects = subjects.filter(subject => subject.id != 1 || subject.id != 2);
                                                                                        const isExistingPlanningLeave = leaveSubjects.find(item => item.id == existingPlanning.subjectId);
                                                                                        const isExistingPlanningWork = workSubjects.find(item => item.id == existingPlanning.subjectId);
                                                                                        if (isExistingPlanningLeave) {
                                                                                            if (existingPlanning.subjectId == 3) {
                                                                                                return db.User.findByPk(planDetails.userId)
                                                                                                    .then(user => {
                                                                                                        user.leaveBalance = user.leaveBalance + 1;
                                                                                                        user.compensatoryTimeOffBalance = user.compensatoryTimeOffBalance - 1;
                                                                                                        existingPlanning.subjectId = subId;
                                                                                                        existingPlanning.reason = planDetails.reason;
                                                                                                        existingPlanning.congee = true;
                                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                                            .then(update => {
                                                                                                                return {
                                                                                                                    msg: "day updated successfully",
                                                                                                                    dayAndUser: update
                                                                                                                }
                                                                                                            })
                                                                                                    })

                                                                                            }
                                                                                            else if (existingPlanning.subjectId == 4) {
                                                                                                return db.User.findByPk(planDetails.userId)
                                                                                                    .then(user => {
                                                                                                        user.sickLeaveBalance = user.sickLeaveBalance + 1;
                                                                                                        user.compensatoryTimeOffBalance = user.compensatoryTimeOffBalance - 1;
                                                                                                        existingPlanning.subjectId = subId;
                                                                                                        existingPlanning.reason = planDetails.reason;
                                                                                                        existingPlanning.congee = true;
                                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                                            .then(update => {
                                                                                                                return {
                                                                                                                    msg: "day updated successfully",
                                                                                                                    dayAndUser: update
                                                                                                                }
                                                                                                            })
                                                                                                    })

                                                                                            }
                                                                                            else {
                                                                                                return { msg: "it's already saved as compensatory leave Request" }
                                                                                            }
                                                                                        }
                                                                                        else if (isExistingPlanningWork) {
                                                                                            return db.User.findByPk(planDetails.userId)
                                                                                                .then(user => {
                                                                                                    if (!existingPlanning.leaveStatus) {
                                                                                                        throw new Error("you can't add a compensation leave on this date because it was rejected")
                                                                                                    }
                                                                                                    else {
                                                                                                        user.compensatoryTimeOffBalance = user.compensatoryTimeOffBalance - 1;
                                                                                                        existingPlanning.subjectId = subId;
                                                                                                        existingPlanning.reason = planDetails.reason;
                                                                                                        existingPlanning.congee = true;
                                                                                                        return Promise.all([existingPlanning.save(), user.save()])
                                                                                                            .then(update => {
                                                                                                                return {
                                                                                                                    msg: "day updated successfully",
                                                                                                                    dayAndUser: update
                                                                                                                }
                                                                                                            })
                                                                                                    }
                                                                                                })

                                                                                        }
                                                                                        else throw new Error('error')
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    user.compensatoryTimeOffBalance = user.compensatoryTimeOffBalance - 1;
                                                                                    return user.save()
                                                                                        .then(user => {
                                                                                            return db.Planning.create({
                                                                                                jour: jour,
                                                                                                campagneId: campagneId,
                                                                                                userId: planDetails.userId,
                                                                                                subjectId: subId,
                                                                                                monthId: monthId,
                                                                                                congee: true,
                                                                                                reason: planDetails.reason

                                                                                            })
                                                                                                .then(result => ({ msg: "congee added successfully", plan: result, userConcerned: user }))
                                                                                                .catch(err => { throw err })
                                                                                        })
                                                                                        .catch(err => { throw err })
                                                                                }
                                                                            })
                                                                            .catch(err => { throw err })


                                                                    }
                                                                    else throw new Error('you dont have compensatoryTimeOffBalance ')
                                                                })
                                                                .catch(err => { throw err })
                                                        }

                                                    } else throw new Error('you have to write the reason for your leave')
                                                }
                                                else {
                                                    throw new Error('Campagne not active')
                                                }

                                            }
                                            else throw new Error("Campagne is not existing yet")
                                        })
                                }
                                else throw new Error("no month error")
                            })


                    }
                }
                else { throw new Error("Invalid Subject") }
            }
            )
            .catch(err => { throw err })
    }

}

const showPlanning = (userId) => {
    return db.Planning.findAll({
        where: { userId: userId },
        include: [{
            model: db.WorkSubject
        }]
    }).then(plannings => {
        if (plannings) {
            const planningsResponse = plannings.map(plan => {
                let date = new Date(plan.jour);
                const obj = {
                    Id: plan.Id,
                    StartTime: date,
                    EndTime: date,
                    Subject: plan.WorkSubject.subject,
                    IsReadonly: plan.isBlocked,
                };

                if (plan.subjectId != 1 && plan.subjectId != 2) {
                    obj.Description = plan.reason;
                }

                return obj;
            });


            return planningsResponse;
        } else {
            return plannings;
        }
    });
};

const showUserPlanningsToVerify = (userDetails) => {
    const { role, userId } = userDetails;
    if (role == 'superadmin') {
        return db.User.findAll({
            where: {
                status: true,
                roleId: 2,
            }, include: [{ model: db.Poste }]
        })
            .then(admins => {
                if (admins) {
                    let usersPlannings = admins.map(user => {


                        return db.Planning.findAll({ where: { userId: user.id } })
                            .then(allPlannings => {
                                if (allPlannings) {

                                    let filterPlanningData = allPlannings.map(plan => {
                                        let date = new Date(plan.jour);
                                        return db.WorkSubject.findOne({ where: { id: plan.subjectId } })
                                            .then(result => {
                                                return {
                                                    Subject: result.subject,
                                                    StartTime: date,
                                                    EndTime: date,
                                                    UserId: user.id,
                                                    IsReadonly: plan.isBlocked,
                                                    FullName: `${user.firstName} ${user.lastName}`
                                                }
                                            })
                                            .catch(err => { throw err })

                                    })
                                    return Promise.all(filterPlanningData)
                                        .then(planningDetails => {
                                            return {
                                                userDetails: {
                                                    id: user.id,
                                                    imageUrl: user.imageName,
                                                    poste: user.Poste.posteName,
                                                    fullName: `${user.firstName} ${user.lastName}`
                                                },
                                                planningDetails: planningDetails
                                            }
                                        })
                                        .catch(err => { throw err })

                                }
                                else return allPlannings
                            })
                    })
                    return Promise.all(usersPlannings)
                        .then(result => {
                            const userData = [];
                            const planningData = [];
                            for (let addUser of result) {
                                userData.push(addUser.userDetails);
                                if (addUser.planningDetails.length) {
                                    for (let addPlan of addUser.planningDetails) {
                                        planningData.push(addPlan)
                                    }
                                }
                            }
                            return {
                                userDetails: userData,
                                planningDetails: planningData
                            }
                        })
                        .catch(err => { throw err })

                }
                else return admins
            })
            .catch(err => { throw err })
    }
    else if (role == 'admin') {
        return db.User.findByPk(userId)
            .then(admin => {
                return db.User.findAll({
                    where: {
                        status: true,
                        departmentId: admin.departmentId,
                    }, include: [{ model: db.Poste }]
                })
                    .then(deptUsers => {
                        if (deptUsers) {

                            let listOfManagersOrCollaboratorsWithoutTeam = deptUsers.filter(user => user.roleId == 3 || (user.roleId == 4 && user.teamId == null));
                            let usersPlannings = listOfManagersOrCollaboratorsWithoutTeam.map(user => {
                                return db.Planning.findAll({ where: { userId: user.id } })
                                    .then(allPlannings => {
                                        let filterPlanningData = allPlannings.map(plan => {
                                            let date = new Date(plan.jour);
                                            return db.WorkSubject.findOne({ where: { id: plan.subjectId } })
                                                .then(result => {
                                                    return {
                                                        subId: result.id,
                                                        Subject: result.subject,
                                                        StartTime: date,
                                                        EndTime: date,
                                                        UserId: user.id,
                                                        IsReadonly: plan.isBlocked,
                                                        FullName: `${user.firstName} ${user.lastName}`
                                                    }
                                                })
                                                .catch(err => { throw err })
                                        })
                                        return Promise.all(filterPlanningData)
                                            .then(planningDetails => {

                                                return {
                                                    userDetails: {
                                                        id: user.id,
                                                        imageUrl: user.imageName,
                                                        poste: user.Poste.posteName,
                                                        fullName: `${user.firstName} ${user.lastName}`

                                                    },
                                                    planningDetails: planningDetails
                                                }
                                            })
                                            .catch(err => { throw err })
                                    })
                            })
                            return Promise.all(usersPlannings)
                                .then(result => {
                                    const currentDate = new Date();
                                    const currentMonth = currentDate.getMonth() + 1;
                                    const currentYear = currentDate.getFullYear();
                                    for (let data of result) {
                                        if (data.planningDetails.length) {
                                            let filterWorkData = data.planningDetails.filter(workDetails => workDetails.subId == 1 || workDetails.subId == 2);
                                            for (let filtredData of filterWorkData) {
                                                const checkDate = new Date(filtredData.StartTime);
                                                const checkYear = checkDate.getFullYear();
                                                const checkMonth = checkDate.getMonth() + 1;
                                                filtredData.year = checkYear;
                                                filtredData.month = checkMonth;
                                            }
                                            const checkNonBlockedPlan = filterWorkData.find(item => !item.IsReadonly && item.year == currentYear && item.month == currentMonth);
                                            if (checkNonBlockedPlan) {
                                                data.userDetails.status = false;
                                            }
                                            else data.userDetails.status = true

                                        }
                                        else data.userDetails.status = true

                                    }
                                    const userData = [];
                                    const planningData = [];
                                    for (let addUser of result) {
                                        userData.push(addUser.userDetails);
                                        if (addUser.planningDetails.length) {
                                            for (let addPlan of addUser.planningDetails) {
                                                planningData.push(addPlan)
                                            }
                                        }
                                    }
                                    return {
                                        userDetails: userData,
                                        planningDetails: planningData
                                    }


                                })
                                .catch(err => { throw err })

                        }
                        else return deptUsers
                    })
                    .catch(err => { throw err })

            })
            .catch(err => { throw err })
    }
    else if (role == 'manager') {
        return db.User.findByPk(userId)
            .then(manager => {
                return db.User.findAll({
                    where: {
                        status: true,
                        teamId: manager.teamId,
                        roleId: 4
                    }, include: [{ model: db.Poste }]
                })
                    .then(teamMembers => {
                        if (teamMembers) {
                            let usersPlannings = teamMembers.map(user => {
                                return db.Planning.findAll({ where: { userId: user.id } })
                                    .then(allPlannings => {
                                        let filterPlanningData = allPlannings.map(plan => {
                                            let date = new Date(plan.jour);
                                            return db.WorkSubject.findOne({ where: { id: plan.subjectId } })
                                                .then(result => {
                                                    return {
                                                        Subject: result.subject,
                                                        StartTime: date,
                                                        EndTime: date,
                                                        UserId: user.id,
                                                        IsReadonly: plan.isBlocked,
                                                        FullName: `${user.firstName} ${user.lastName}`
                                                    }
                                                })
                                                .catch(err => { throw err })
                                        })
                                        return Promise.all(filterPlanningData)
                                            .then(planningDetails => {
                                                return {
                                                    userDetails: {
                                                        id: user.id,
                                                        imageUrl: user.imageName,
                                                        poste: user.Poste.posteName,
                                                        fullName: `${user.firstName} ${user.lastName}`
                                                    },
                                                    planningDetails: planningDetails
                                                }
                                            })
                                            .catch(err => { throw err })
                                    })
                            })
                            return Promise.all(usersPlannings)
                                .then(result => {
                                    for (let data of result) {
                                        if (data.planningDetails.length) {
                                            const filterWorkData = data.planningDetails.filter(workDetails => workDetails.subId == 1 || workDetails.subId == 2);
                                            const checkNonBlockedPlan = filterWorkData.find(item => !item.IsReadonly)
                                            if (checkNonBlockedPlan) {
                                                data.userDetails.status = false;
                                            }
                                            else data.userDetails.status = true

                                        }
                                        else data.userDetails.status = true

                                    }
                                    const userData = [];
                                    const planningData = [];
                                    for (let addUser of result) {
                                        userData.push(addUser.userDetails);
                                        if (addUser.planningDetails.length) {
                                            for (let addPlan of addUser.planningDetails) {
                                                planningData.push(addPlan)
                                            }
                                        }
                                    }
                                    return {
                                        userDetails: userData,
                                        planningDetails: planningData
                                    }
                                })
                                .catch(err => { throw err })
                        }
                        else return teamMembers

                    })
                    .catch(err => { throw err })
            })
            .catch(err => { throw err })
    }
    else throw new Error('Not authorized')

}

const modifyUserPlan = (planDetails) => {


    let day = new Date(planDetails.jour);
    const currentDate = new Date();
    if (day < currentDate) {
        throw new Error("Day passed or campagne invalid")
    }

    else {

        return db.WorkSubject.findAll()
            .then(subjects => {
                const findSubject = subjects.find(item => item.subject == planDetails.subject);
                if (findSubject) {
                    let subId = findSubject.id;
                    if (subId == 1 || subId == 2) {
                        const jour = day.toISOString().split('T')[0];

                        return db.Planning.findOne({
                            where: {
                                userId: planDetails.employeeId,
                                jour: jour
                            }
                        })
                            .then(existingPlanning => {
                                if (existingPlanning) {

                                    if (existingPlanning.isBlocked) {
                                        throw new Error('you cant modify this day because its confirmed or passed')
                                    }
                                    else {
                                        const workSubjects = subjects.filter(subject => subject.id == 1 || subject.id == 2);
                                        const leaveSubjects = subjects.filter(subject => subject.id != 1 && subject.id != 2);
                                        const isExistingPlanningLeave = leaveSubjects.find(item => item.id == existingPlanning.subjectId);
                                        const isExistingPlanningWork = workSubjects.find(item => item.id == existingPlanning.subjectId);

                                        if (isExistingPlanningLeave) {
                                            throw new Error('you cant update a leave , you have to reject it first ')
                                        }
                                        else if (isExistingPlanningWork) {
                                            const checkexistingplan = existingPlanning.subjectId;
                                            existingPlanning.subjectId = subId;
                                            existingPlanning.isBlocked = true;
                                            return existingPlanning.save()
                                                .then(update => {
                                                    // return { msg: "day updated and email sent successfully ", day: update }
                                                    if (checkexistingplan == subId) {
                                                        return { msg: "day updated  ", day: update }
                                                    }
                                                    else if (checkexistingplan !=subId) {
                                                        return db.WorkSubject.findByPk(subId)
                                                            .then(result => {
                                                                return db.User.findByPk(employeeId)
                                                                    .then(user => {
                                                                        return transporter.sendMail(mailOptions(user.email, jour, result.subject))
                                                                            .then(() => ({ msg: "day updated and email sent successfully ", day: update }))
                                                                            .catch(err => { throw err })
                                                                    })
                                                                    .catch(err => { throw err })
                                                            })

                                                    }
                                                    else {
                                                        return db.WorkSubject.findByPk(1)
                                                            .then(result => {
                                                                return db.User.findByPk(employeeId)
                                                                    .then(user => {
                                                                        return transporter.sendMail(mailOptions(user.email, jour, result.subject))
                                                                            .then(() => ({ msg: "day updated and email sent successfully ", day: update }))
                                                                            .catch(err => { throw err })
                                                                    })
                                                                    .catch(err => { throw err })
                                                            })
                                                    }
                                                })
                                                .catch(err => { throw err })
                                        }

                                        else throw new Error('an error')
                                    }
                                }
                                else {

                                    throw new Error("day is not filled by the user yet, you can't modify it")

                                }
                            })
                            .catch(err => { throw err })
                    }

                    else {
                        throw new Error("you can't modify a leave to your employee")//check the leave in leave confirmation interface
                    }
                }
                else { throw new Error("Invalid Subject") }
            }
            )
            .catch(err => { throw err })
    }

}
const confirmPlans = (userDetails) => {
    const userData = {
        employeeId: userDetails
    };

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    let campagneData;
    return db.Campagne.findOne({ where: { year: currentYear } })
        .then(campagne => {
            if (!campagne) {
                throw new Error("Campagne is not created yet. You can't confirm any plan.");
            }
            campagneData = campagne;
            if (!campagne.status) {
                throw new Error("Campagne is inactive.");
            }
            return db.Month.findOne({ where: { monthOrder: currentMonth } });
        })
        .then(currentMonth => {

            if (!currentMonth) {
                throw new Error("Current month is not defined.");
            }
            return db.Planning.findAll({
                where: {
                    monthId: currentMonth.id,
                    userId: userData.employeeId
                }
            });
        })
        .then(plannings => {

            if (!plannings || plannings.length === 0) {
                return { msg: "No plans to confirm." };
            }
            return db.User.findByPk(userData.employeeId)
                .then(user => {
                    const filterPlans = plannings.filter(plan => (plan.subjectId == 1 || plan.subjectId == 2) && !plan.isBlocked);
                    if (filterPlans.length > 0) {
                        const blockAllDays = filterPlans.map(plan => {
                            plan.isBlocked = true;
                            return plan.save();
                        });
                        return Promise.all(blockAllDays)
                            .then(() => {
                                const mailToSend = {
                                    from: process.env.email,
                                    to: user.email,
                                    subject: 'Plan Confirmation',
                                    text: `All your new plans in this month are confirmed.`
                                };
                                transporter.sendMail(mailToSend);
                                return { msg: `All plans of ${user.firstName} ${user.lastName} in ${currentMonth.name}-${campagneData.year} are confirmed.` };
                            });
                    } else {
                        return { msg: "All the plannings are already confirmed in the current month and campagne." };
                    }
                });
        })
        .catch(err => {
            throw err;
        });
};







module.exports = { addNewPlanning, getDifferentSubjects, showPlanning, showUserPlanningsToVerify, modifyUserPlan, getSubjectsForHighRoles, confirmPlans }