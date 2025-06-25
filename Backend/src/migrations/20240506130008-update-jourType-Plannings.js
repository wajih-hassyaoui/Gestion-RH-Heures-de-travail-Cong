'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Plannings', 'jour', {
      type: Sequelize.STRING,
      allowNull: false 
    });

    await queryInterface.addColumn('Plannings','isBlocked', {
      type: Sequelize.BOOLEAN,
      defaultValue: false 
    });
  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.changeColumn('Plannings', 'jour', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.removeColumn('Plannings','isBlocked');
  }
};
