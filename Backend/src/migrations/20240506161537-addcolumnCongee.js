'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Plannings','congee', {
      type: Sequelize.BOOLEAN
      
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Plannings','congee');
  }
};
