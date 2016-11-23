'use strict';
module.exports = function (sequelize, DataTypes) {
  var Task = sequelize.define('Task', {
    userId: DataTypes.STRING,
    taskName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  });
  return Task;
};
