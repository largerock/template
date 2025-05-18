import UserController from '../controllers/user-profile.controller';
import { middlewareAuth } from '../middleware/auth-middleware';
import express from 'express';

const router = express.Router();
router.post('/clerk-webhook', UserController.clerkWebhook);
router.use(middlewareAuth);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile successfully retrieved
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
router.get('/me', UserController.getCurrentUser);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     description: Updates the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               jobTitleId:
 *                 type: string
 *               company:
 *                 type: string
 *               bio:
 *                 type: string
 *               interestIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: url
 *               socialLinks:
 *                 type: object
 *     responses:
 *       200:
 *         description: User profile successfully updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - user not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/me', UserController.update);

/**
 * @swagger
 * /api/users/id/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a user profile by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile successfully retrieved
 *       401:
 *         description: Unauthorized - user not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/id/:id', UserController.getById);


/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Get all users
 *     description: Get all users with pagination
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Users successfully retrieved
 *       500:
 *         description: Server error
 */
router.get('/all', UserController.getAll);

/**
 * @swagger
 * /api/users/seed:
 *   post:
 *     summary: Seed users from JSON data
 *     description: Seeds the database with test users (development only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users successfully seeded
 *       401:
 *         description: Unauthorized - user not authenticated or not admin
 *       500:
 *         description: Server error
 */
router.post('/seed', UserController.seed);

/**
 * @swagger
 * /api/users/seed:
 *   delete:
 *     summary: Delete all test users
 *     description: Deletes all users with 'test_' prefix in their ID (development only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test users successfully deleted
 *       401:
 *         description: Unauthorized - user not authenticated or not admin
 *       500:
 *         description: Server error
 */
router.delete('/seed', UserController.deleteSeed);

/**
 * @swagger
 * /api/users/test-check:
 *   get:
 *     summary: Check test users existence
 *     description: Checks if test users exist in the database (development only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test users check completed
 *       401:
 *         description: Unauthorized - user not authenticated or not admin
 *       500:
 *         description: Server error
 */
router.get('/test-check', UserController.checkTestUsers);

/**
 * @swagger
 * /api/users/public-profiles:
 *   post:
 *     summary: Get public user profiles by IDs
 *     description: Retrieves public profiles for multiple users by their IDs (excludes private information like email and phone)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to retrieve profiles for
 *     responses:
 *       200:
 *         description: Public user profiles successfully retrieved
 *       400:
 *         description: Invalid input - userIds must be a non-empty array
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
router.post('/public-profiles', UserController.getPublicUserProfiles);

export default router;
