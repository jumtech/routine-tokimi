'use strict';
module.exports = function(sequelize, DataTypes) {
  var routine = sequelize.define('routine', {
    user_id: DataTypes.STRING,
    routine_name: DataTypes.STRING,
    first_task_id: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return routine;
};