'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Month extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Month.init({
    monthName: DataTypes.STRING,
    monthOrder: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Month',
  });
  return Month;
};