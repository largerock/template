import { DataTypes } from "sequelize";
import sequelize from "../../config/database";
import { UserModel } from "../user-profile";
import { InterestModel } from "../interest";

export const UserInterestModel = sequelize.define(
  'UserInterest',
  {
    clerkUserId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: UserModel,
        key: 'clerkUserId',
      },
    },
    interestId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: InterestModel,
        key: 'id',
      },
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: 'user_interests',
    timestamps: false,
  }
);

// User-Interest Many-to-Many
UserModel.belongsToMany(InterestModel, {
  through: UserInterestModel,
  foreignKey: 'clerkUserId',
  otherKey: 'interestId',
  as: 'interests',
});

InterestModel.belongsToMany(UserModel, {
  through: UserInterestModel,
  foreignKey: 'interestId',
  otherKey: 'clerkUserId',
  as: 'users',
});