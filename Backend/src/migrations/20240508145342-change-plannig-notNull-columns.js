'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Plannings', 'monthId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Months',
        key: 'id',
      },
      allowNull: false
    });
    await queryInterface.changeColumn('Plannings', 'campagneId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Campagnes',
        key: 'id',
      },
      allowNull: false
    });
    await queryInterface.changeColumn('Plannings', 'subjectId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'WorkSubjects',
        key: 'id',
      },
      allowNull: false
    });
    await queryInterface.changeColumn('Plannings', 'jour', {
      type: Sequelize.DATE,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Plannings', 'monthId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Months',
        key: 'id',
      }
    });
    await queryInterface.changeColumn('Plannings', 'campagneId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Campagnes',
        key: 'id',
      }
    });
    await queryInterface.changeColumn('Plannings', 'subjectId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'WorkSubjects',
        key: 'id',
      }
    });
    await queryInterface.changeColumn('Plannings', 'jour', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};
