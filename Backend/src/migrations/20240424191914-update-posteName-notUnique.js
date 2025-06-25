'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Postes', 'posteName', {
      type: Sequelize.STRING,
      unique: false 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Postes', 'posteName', {
      type: Sequelize.STRING,
      unique: true 
    });
  }
};
