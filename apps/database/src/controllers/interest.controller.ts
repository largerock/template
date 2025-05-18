import {
  Request, RequestHandler, Response
} from 'express';
import interestService from '../services/interests.service';
import {
  InterestCreate,
  InterestUpdate,
} from '@template/core-types';

type InterestController = {
  get: RequestHandler;
  getAll: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  search: RequestHandler;
  seed: RequestHandler;
};

const interestController: InterestController = {
  // Get interests by IDs
  get: (async (req: Request, res: Response) => {
    try {
      const { ids } = req.query;

      // Handle case where no IDs are provided
      if (!ids) {
        res.status(400).json({ error: 'No interest IDs provided' });
        return;
      }

      // Convert single ID to array if needed
      const interestIds = Array.isArray(ids) ? ids : [ids];

      const interests = await interestService.get(interestIds as string[]);
      res.status(200).json(interests);
      return;
    } catch (error) {
      console.error('Error in getInterests controller:', error);
      res.status(500).json({
        error: 'Failed to get interests',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  }) as RequestHandler,

  // Get all interests
  getAll: (async (_req: Request, res: Response) => {
    try {
      const interests = await interestService.getAll();
      res.status(200).json(interests);
      return;
    } catch (error) {
      console.error('Error in getAllInterests controller:', error);
      res.status(500).json({
        error: 'Failed to get all interests',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  }) as RequestHandler,

  // Create a new interest
  create: (async (req: Request, res: Response) => {
    try {
      const interestData: InterestCreate = req.body;

      if (!interestData.name) {
        res.status(400).json({ error: 'Interest name is required' });
        return;
      }

      const newInterest = await interestService.create(interestData);
      res.status(201).json(newInterest);
      return;
    } catch (error) {
      console.error('Error in createInterest controller:', error);
      res.status(500).json({
        error: 'Failed to create interest',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  }) as RequestHandler,

  // Update an interest
  update: (async (req: Request, res: Response) => {
    try {
      const interestData: InterestUpdate = req.body;

      if (!interestData.id) {
        res.status(400).json({ error: 'Interest ID is required' });
        return;
      }

      const updatedInterest = await interestService.update(interestData);
      res.status(200).json(updatedInterest);
      return;
    } catch (error) {
      console.error('Error in updateInterest controller:', error);
      res.status(500).json({
        error: 'Failed to update interest',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  }) as RequestHandler,

  // Delete an interest
  delete: (async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Interest ID is required' });
        return;
      }

      await interestService.delete(id);
      res.status(204).send();
      return;
    } catch (error) {
      console.error('Error in deleteInterest controller:', error);
      res.status(500).json({
        error: 'Failed to delete interest',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  }) as RequestHandler,

  // Search interests
  search: (async (req: Request, res: Response) => {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const interests = await interestService.search(query);
      res.status(200).json(interests);
      return;
    } catch (error) {
      console.error('Error in searchInterests controller:', error);
      res.status(500).json({
        error: 'Failed to search interests',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  }) as RequestHandler,

  // Seed interests from the default values in the data/interests.json file
  seed: (async (_req: Request, res: Response) => {
    try {
      await interestService.seed();
      res.status(200).json({ message: 'Interests seeded successfully' });
      return;
    } catch (error) {
      console.error('Error in seedInterests controller:', error);
      res.status(500).json({
        error: 'Failed to seed interests',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  }) as RequestHandler,
};


export default interestController;
