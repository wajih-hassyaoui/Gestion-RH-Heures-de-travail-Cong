'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Planning extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Planning.belongsTo(models.User, { foreignKey: 'userId' });
      Planning.belongsTo(models.Month, { foreignKey: 'monthId' });
      Planning.belongsTo(models.Campagne, { foreignKey: 'campagneId' });
      Planning.belongsTo(models.WorkSubject, { foreignKey: 'subjectId'})
    }
  }
  Planning.init({
    jour: {
      type: DataTypes.STRING,
      allowNull: false
    },
    leaveStatus: {
      type: DataTypes.BOOLEAN
    },
    reason: {
      type: DataTypes.STRING
    },
    monthId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Month',
        key: 'id'
      }
    },
    campagneId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Campagne',
        key: 'id' 
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'WorkSubject',
        key: 'id'
      }
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue:false

    },
    congee: {
      type: DataTypes.BOOLEAN,
      
    }
  }, {
    sequelize,
    modelName: 'Planning',
  });
  return Planning;
};