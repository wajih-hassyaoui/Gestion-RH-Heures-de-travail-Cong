'use strict';
/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      roleName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
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

    await queryInterface.bulkInsert('Roles', [
      {
        roleName: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: 'manager',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: 'collaborator',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    await queryInterface.addColumn('Users', 'roleId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Roles',
        key: 'id',
      }
    });

    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'super',
        lastName:'admin',
        email:'wajihhassyoui123@gmail.com',
        roleId:1,
        gender:"M",
        sickLeaveBalance:1,
        compensatoryTimeOffBalance:11,
        leaveBalance:11,
        password:'1234',
        telephone:12345678,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.dropTable('Roles');
    await queryInterface.removeColumn('Users', 'roleId');
  }
};
