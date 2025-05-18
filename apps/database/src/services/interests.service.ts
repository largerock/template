import { Op } from 'sequelize';
import {
  Interest,
  InterestCreate,
  InterestUpdate,
} from '@template/core-types';
import { InterestModel } from '../models';
import { v4 as uuidv4 } from 'uuid';
import defaultInterests from '../../data/interests.json';

// Define service interface
type InterestService = {
  get(ids: string[]): Promise<Interest[]>;
  getAll(): Promise<Interest[]>;
  create(interest: InterestCreate): Promise<Interest>;
  update(interest: InterestUpdate): Promise<Interest>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Interest[]>;
  seed(): Promise<void>;
};

// Create service object
const interestService: InterestService = {
  // Get user by ID
  async get(ids: string[]) {
    const interests = await InterestModel.findAll({where: {id: {[Op.in]: ids,},},});
    return interests.map(interest => interest.toJSON() as Interest);
  },

  async getAll() {
    const interests = await InterestModel.findAll();
    return interests.map(interest => interest.toJSON() as Interest);
  },

  // Update user profile
  async update(interest: InterestUpdate) {
    const updatedInterest = await InterestModel.update(
      interest,
      { where: { id: interest.id } }
    );
    return updatedInterest[0] as unknown as Interest;
  },

  async delete(interestId: string) {
    await InterestModel.destroy({ where: { id: interestId } });
  },

  // Search users
  async search(query: string) {
    const interests = await InterestModel.findAll({
      where: { name: { [Op.iLike]: `%${query}%` } },
      order: [['name', 'ASC']],
    });
    return interests.map(interest => interest.toJSON() as Interest);
  },

  async create(interest: InterestCreate) {
    const newInterest = await InterestModel.create({
      ...interest,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return newInterest.get();
  },

  async seed() {
    const interests = await InterestModel.findAll();
    if (interests.length === 0) {
      const interestsToCreate = defaultInterests.flatMap(category =>
        category.interests.map(interest => ({
          id: interest.id,
          name: interest.name,
          popularity: interest.popularity,
          category: category.category,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
      await InterestModel.bulkCreate(interestsToCreate);
    }
  },
};

export default interestService;
