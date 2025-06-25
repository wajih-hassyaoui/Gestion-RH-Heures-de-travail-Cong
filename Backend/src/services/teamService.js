const db = require('../models');
const teamValidation = require('../joiValidation/teamValidation');


const createTeam = (newTeam) => {
  const teamDetails = {
    teamName: newTeam.teamName
  }
  const validationResult = teamValidation.validation(teamDetails);
  if (validationResult instanceof Error) {
    throw validationResult;
  } else {
    return db.User.findOne({ where: { id: newTeam.adminId } })
      .then(admin => {
        if (!admin) {
          throw new Error('Admin user not found');
        }
        return db.Team.create({
          teamName: newTeam.teamName,
          departmentId: admin.departmentId,
        })

      });
  }
};


const allTeams = (adminId) => {

  return db.User.findOne({ where: { id: adminId } })
    .then(admin => {
      return db.Team.findAll({
        where: { departmentId: admin.departmentId },
        include: [{
          model: db.User,
          required: false,
          include: [{
            model: db.Role
          }]
        }]
      })
        .then(teams => {
          if (teams.length) {
            const teamDetails = teams.map(team => {
              const activeUsers = team.Users.filter(user => user.status);
              const teamManager = team.Users.find(user => user.Role.roleName === 'manager');
              const managerName = teamManager ? `${teamManager.firstName} ${teamManager.lastName}` : 'No Manager';
              if (!teamManager) {
                return {
                  teamId: team.id,
                  teamName: team.teamName,
                  status: team.status,
                  teamManager: managerName,
                  numberOfMembers: activeUsers.length
                };
              }
              else {
                return {
                  teamId: team.id,
                  teamName: team.teamName,
                  status: team.status,
                  teamManager: managerName,
                  managerId: teamManager.id,
                  numberOfMembers: activeUsers.length
                };
              }

            });
            return teamDetails;
          }
          else return teams;


        })

        .catch(err => {
          throw err;
        });
    })

}

const deleteTeam = (teamDetails) => {
  return db.Team.findOne({
    where: {
      id: teamDetails.teamId
    },
    include: [{
      model: db.User,
      required: false,
      include: [{
        model: db.Role
      }]
    }]
  }
  )
    .then(team => {
      if (team) {
        const activeUsers = team.Users.filter(user => user.status);
        if (activeUsers.length && teamDetails.status == false) {
          throw new Error("Impossible to disactivate this Team , it contains employees . ")
        }
        else if (!activeUsers.length && teamDetails.status == false) {
          team.status = teamDetails.status;
          return team.save();
        }
        else {
          team.status = teamDetails.status;
          return team.save();
        }
      }
      else return team
    })
    .then(statusChange => {
      if (statusChange) {

        if (statusChange.status) {
          return "Team restored successfully";
        } else {
          return "Team disactivated successfully";
        }

      }
      else throw new Error("Team not found ");

    })

    .catch(err => {
      throw err;
    });
}


const allActiveTeams = (adminId) => {
  return db.User.findByPk(adminId)
    .then(admin => {
      return db.Team.findAll({
        where: {
          status: true,
          departmentId: admin.departmentId
        },
        include: [{
          model: db.User,
          required: false,
        }]
      })
        .then(teams => {
          const teamsWithManager = teams.filter(team => team.Users.length)
          const teamsWithoutManager = teams.filter(team => !team.Users.length)
          return {
            listTeamsWithManager: teamsWithManager,
            listTeamsWithoutManager: teamsWithoutManager
          }
        })
    })
    .catch(err => { throw err })
}




const updateTeam = (teamDetails) => {
  let {
    newTeamName,
    teamId,
    newManagerId,
    adminId,
    teamData
  } = teamDetails;

  const validationResult = teamValidation.validation({ teamName: newTeamName });
  if (validationResult instanceof Error) {
    throw validationResult;
  } else {
    return db.Team.findOne({
      where: {
        id: teamId
      },
      include: [{
        model: db.User
      }]
    })
      .then(team => {
        if (!team) {
          throw new Error("team not found");
        } else {
          return db.User.findByPk(adminId)
            .then(admin => {
              return db.User.findAll({
                where: {
                  departmentId: admin.departmentId,
                  status: true
                }
              })
                .then(users => {
                  if (team.Users.length) {
                    let newManager = users.find(emp => emp.id == newManagerId);
                    let oldManager = users.find(manager => manager.roleId == 3 && manager.teamId == teamId);
                    const oldManagerTeamId = oldManager.teamId;
                    let checkMangerinCollaboratorsList = teamData.find(emp => emp.id == newManagerId);

                    if (checkMangerinCollaboratorsList) { teamData = teamData.filter(emp => emp.id !== newManagerId); }
                    if (newManager && oldManager && newManager.id !== oldManager.id && teamData.length) {
                      oldManager.roleId = 4;
                      oldManager.teamId = null;
                      team.teamName = newTeamName;
                      let listToChange = users.filter(emp => (!emp.teamId || emp.teamId == teamId) && (emp.roleId == 4));
                      let listToaddToTeam = [];
                      let listToremoveTeam = [];
                      for (let emp of listToChange) {

                        if (teamData.some(obj => obj.id === emp.id)) {
                          listToaddToTeam.push(emp)
                        } else {
                          listToremoveTeam.push(emp)
                        }
                      }
                      const addNewTeamates = listToaddToTeam.map(emp => {
                        emp.teamId = teamId;
                        return emp.save()
                      })
                      const collabsNotInTeam = listToremoveTeam.map(emp => {
                        emp.teamId = null;
                        return emp.save()
                      })
                      return Promise.all([oldManager.save(), newManager.update({ roleId: 3, teamId: oldManagerTeamId }), team.save(), addNewTeamates, collabsNotInTeam])
                        .then((result) => ({
                          msg: "Team updated successfully",
                          result: result
                        }));
                    }
                    else if (newManager && oldManager && newManager.id == oldManager.id && teamData.length) {
                      team.teamName = newTeamName;
                      const listToChange = users.filter(emp => (!emp.teamId || emp.teamId == teamId) && (emp.roleId == 4));
                      const listToaddToTeam = [];
                      const listToremoveTeam = [];
                      for (let emp of listToChange) {

                        if (teamData.some(obj => obj.id === emp.id)) {
                          listToaddToTeam.push(emp)
                        } else {
                          listToremoveTeam.push(emp)
                        }
                      }
                      const addNewTeamates = listToaddToTeam.map(emp => {
                        emp.teamId = teamId;
                        return emp.save()
                      })
                      const collabsNotInTeam = listToremoveTeam.map(emp => {
                        emp.teamId = null;
                        return emp.save()
                      })
                      return Promise.all([team.save(), addNewTeamates, collabsNotInTeam])
                        .then((result) => ({
                          msg: "Team updated successfully",
                          result: result
                        }));
                    }
                    else if (newManager && oldManager && newManager.id !== oldManager.id && !teamData.length) {
                      oldManager.roleId = 4;
                      oldManager.teamId = null;
                      team.teamName = newTeamName;
                      return Promise.all([oldManager.save(), newManager.update({ roleId: 3, teamId: oldManagerTeamId }), team.save()])
                        .then((result) => {
                          return db.Team.findOne({
                            where: {
                              id: teamId
                            },
                            include: [{
                              model: db.User
                            }]
                          })
                            .then(teamData => {
                              if (teamData.Users.length) {
                                let teamMustBeEmpty = teamData.Users.map(collaborator => {
                                  collaborator.teamId = null;
                                  return collaborator.save()
                                })
                                return Promise.all(teamMustBeEmpty)
                                  .then(result => {
                                    return {
                                      msg: "Team updated successfully",
                                      result: result
                                    }
                                  })
                                  .catch(err => { throw err })
                              }
                              else return {
                                msg: "Team updated successfully",
                                result: result
                              }
                            })
                        });
                    }
                    else if (newManager && oldManager && newManager.id == oldManager.id && !teamData.length) {
                      team.teamName = newTeamName;
                      return team.save()
                        .then(() => {
                          team.Users=team.Users.filter(user=>user.roleId!=3)
                          let teamMustBeEmpty = team.Users.map(collaborator => {
                            collaborator.teamId = null;
                            return collaborator.save()
                          })
                          return Promise.all(teamMustBeEmpty)
                            .then(result => {
                              return {
                                msg: "Team updated successfully",
                                result: result
                              }
                            })
                            .catch(err => { throw err })
                        })
                    }
                    else {
                      team.teamName = newTeamName;
                      return team.save()
                        .then(() => "Team updated successfully");
                    }
                  }
                  else {
                    let newManager = users.find(emp => emp.id == newManagerId);
                    let checkMangerinCollaboratorsList = teamData.find(emp => emp.id == newManagerId);
                    if (checkMangerinCollaboratorsList) { teamData = teamData.filter(emp => emp.id !== newManagerId); }
                    if (newManager && teamData.length) {

                      team.teamName = newTeamName;
                      let listToChange = users.filter(emp => !emp.teamId && emp.roleId == 4);
                      let listToaddToTeam = [];

                      for (let emp of listToChange) {

                        if (teamData.some(obj => obj.id === emp.id)) {
                          listToaddToTeam.push(emp)
                        }
                      }
                      const addNewTeamates = listToaddToTeam.map(emp => {
                        emp.teamId = teamId;
                        return emp.save()
                      })

                      return Promise.all([newManager.update({ roleId: 3, teamId: teamId }), team.save(), addNewTeamates])
                        .then((result) => ({
                          msg: "Team updated successfully",
                          result: result
                        }));
                    }
                    else if (newManager && !teamData.length) {
                      team.teamName = newTeamName;
                      return Promise.all([newManager.update({ roleId: 3, teamId: teamId }), team.save()])
                        .then((result) => ({
                          msg: "Team updated successfully",
                          result: result
                        }));
                    }
                    else {
                      team.teamName = newTeamName;
                      return team.save()
                        .then(result => ({
                          msg: "Team updated successfully",
                          result: result
                        }))
                        .catch(err => { throw err })
                    }

                  }
                });
            });
        }
      });
  }
};



//hedhiya zeyda 
const allCollaborators = (adminId) => {
  return db.User.findByPk(adminId)
    .then(admin => {
      return db.User.findAll({
        where: {
          departmentId: admin.departmentId,
          status: true,
          roleId: 4
        }
      })
        .then(collaborators => {
          const collaboratorsWithoutTeam = collaborators.filter(emp => !emp.teamId);
          return collaboratorsWithoutTeam;
        })
    })
}

const getToUpdateCollaborators = (teamDetails) => {
  const { teamId, adminId } = teamDetails
  return db.User.findByPk(adminId)
    .then(admin => {
      return db.User.findAll({
        where: {
          departmentId: admin.departmentId,
          status: true,
          roleId: 4
        }
      })
        .then(collaborators => {
          const collaboratorsWithoutTeamOrInSameTeam = collaborators.filter(emp => !emp.teamId || emp.teamId == teamId);
          const filtredData = collaboratorsWithoutTeamOrInSameTeam.map(emp => {
            return {
              id: emp.id,
              fullName: `${emp.firstName} ${emp.lastName}`,
              teamId: emp.teamId

            }
          })
          return filtredData;

        })
        .catch(err => { throw err })
    })
    .catch(err => { throw err })
}



module.exports = { createTeam, allTeams, deleteTeam, allActiveTeams, updateTeam, allCollaborators, getToUpdateCollaborators }

