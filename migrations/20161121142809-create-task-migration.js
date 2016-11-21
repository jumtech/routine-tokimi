'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'tasks',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        },
        userId: Sequelize.STRING,
        taskName: Sequelize.STRING
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('tasks');
  }
};
