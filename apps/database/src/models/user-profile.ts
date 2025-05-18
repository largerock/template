import sequelize from '../config/database';
import { DataTypes, Model, Op } from 'sequelize';
import { UserProfile, userThemeSchema, availabilitySchema } from '@template/core-types';
import { locationValidator } from '../utils/validation';

export const UserModel = sequelize.define<Model<UserProfile>>(
  'User',
  {
    clerkUserId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {isEmail: true,},
    },
    availability: {
      type: DataTypes.ENUM(...availabilitySchema.options),
      allowNull: true,
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    headline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    theme: {
      type: DataTypes.ENUM(...userThemeSchema.options),
      allowNull: false,
      defaultValue: 'SYSTEM',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: { locationValidator },
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {isUrl: true,},
    },
    socialLinks: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        name: 'users_firstName_idx',
        fields: ['firstName']
      },
      {
        name: 'users_lastName_idx',
        fields: ['lastName']
      },
      {
        name: 'users_fullName_idx',
        fields: ['firstName', 'lastName']
      }
    ],
    scopes: {
      inLocation(locationTerm: string) {
        return {where: sequelize.literal(`location::text ILIKE '%${locationTerm.replace(/'/g, "''")}%'`)};
      },
      radiusSearch(lat: number, lng: number, radiusInKm: number) {
        return {
          where: sequelize.literal(`
            (
              6371 * acos(
                cos(radians(${lat})) *
                cos(radians(("User"."location"->>'latitude')::float)) *
                cos(radians(("User"."location"->>'longitude')::float) - radians(${lng})) +
                sin(radians(${lat})) *
                sin(radians(("User"."location"->>'latitude')::float))
              )
            ) <= ${radiusInKm}
          `)
        };
      },
      cityCountrySearch(city?: string, state?: string, country?: string) {
        const conditions = [];
        if (city) conditions.push(`("User"."location"->>'city') ILIKE '%${city.replace(/'/g, "''")}%'`);
        if (state) conditions.push(`("User"."location"->>'state') ILIKE '%${state.replace(/'/g, "''")}%'`);
        if (country) conditions.push(`("User"."location"->>'country') ILIKE '%${country.replace(/'/g, "''")}%'`);

        return {
          where: sequelize.literal(conditions.length > 0 ? conditions.join(' AND ') : 'TRUE')
        };
      },
      nameSearch(term: string) {
        return {
          where: {
            [Op.or]: [
              { firstName: {[Op.iLike]: `%${term}%`} },
              { lastName: {[Op.iLike]: `%${term}%`} },
              sequelize.where(
                sequelize.fn('concat', sequelize.col('firstName'), ' ', sequelize.col('lastName')),
                {
                  [Op.iLike]: `%${term}%`
                }
              )
            ]
          }
        };
      }
    },
  },
);
