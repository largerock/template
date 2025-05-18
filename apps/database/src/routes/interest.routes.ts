import { Router } from 'express';
import interestController from '../controllers/interest.controller';

const router = Router();

/**
 * @swagger
 * /api/interests/ids:
 *   get:
 *     summary: Get interests by IDs
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         required: true
 *         description: Array of interest IDs
 *     responses:
 *       200:
 *         description: List of interests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Interest'
 *       400:
 *         description: Invalid interest IDs provided
 *       500:
 *         description: Server error
 */
router.get('/ids', interestController.get);

/**
 * @swagger
 * /api/interests:
 *   post:
 *     summary: Create a new interest
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterestCreationAttributes'
 *     responses:
 *       201:
 *         description: Interest created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Interest'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', interestController.create);

/**
 * @swagger
 * /api/interests:
 *   put:
 *     summary: Update an existing interest
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterestUpdateAttributes'
 *     responses:
 *       200:
 *         description: Interest updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Interest'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.put('/', interestController.update);

/**
 * @swagger
 * /api/interests/{id}:
 *   delete:
 *     summary: Delete an interest by ID
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interest ID
 *     responses:
 *       204:
 *         description: Interest deleted successfully
 *       400:
 *         description: Invalid interest ID
 *       500:
 *         description: Server error
 */
router.delete('/:id', interestController.delete);


/**
 * @swagger
 * /api/interests/seed:
 *   post:
 *     summary: Seed interests from the default values in the data/interests.json file
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interests seeded successfully
 *       500:
 *         description: Server error
 */
router.post('/seed', interestController.seed);

/**
 * @swagger
 * /api/interests/all:
 *   get:
 *     summary: Get all interests
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of interests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Interest'
 *       500:
 *         description: Server error
 */
router.get('/all', interestController.getAll);

export default router;
