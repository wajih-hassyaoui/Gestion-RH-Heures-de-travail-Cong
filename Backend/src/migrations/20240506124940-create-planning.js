'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Plannings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      jour: {
        type: Sequelize.DATE
      },
      leaveStatus: {
        type: Sequelize.BOOLEAN
      },
      reason: {
        type: Sequelize.STRING
      },
      monthId: {
        type: Sequelize.INTEGER,
          references: {
          model: 'Months', 
          key: 'id',
        }
      },
      campagneId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Campagnes', 
          key: 'id',
        }
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', 
          key: 'id',
        }
      },
      subjectId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'WorkSubjects', 
          key: 'id',
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Plannings');
  }
};