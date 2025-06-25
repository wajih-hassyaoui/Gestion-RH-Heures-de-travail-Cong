'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Months', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      monthName: {
        type: Sequelize.STRING
      },
      monthOrder:{
        type: Sequelize.INTEGER
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
    await queryInterface.bulkInsert('Months', [
      {
        monthName: 'january',
        monthOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'february',
        monthOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'march',
        monthOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'april',
        monthOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'may',
        monthOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'june',
        monthOrder: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'july',
        monthOrder: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'august',
        monthOrder: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'september',
        monthOrder: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'october',
        monthOrder: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'november',
        monthOrder: 11,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        monthName: 'december',
        monthOrder: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Months');
  }
};