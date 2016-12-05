'use strict';
module.exports = function(sequelize, DataTypes) {
  var task = sequelize.define('task', {
    user_id: DataTypes.STRING,
    //task_id: DataTypes.STRING,
    task_name: DataTypes.STRING,
    next_task_id: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return task;
};