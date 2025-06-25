'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WorkSubjects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subject: {
        type: Sequelize.STRING
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


    await queryInterface.bulkInsert('WorkSubjects', [
      {
        subject: 'remote work',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subject: 'on site work',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subject: 'leave',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subject: 'sick leave',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        subject: 'compensation leave',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
    ]);

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WorkSubjects');
  }
};