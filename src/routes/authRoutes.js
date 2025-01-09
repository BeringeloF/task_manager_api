import express from 'express';
import * as authController from '../controller/authController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - passwordConfirm
 *       properties:
 *         user_id:
 *           type: integer
 *           description: user id
 *         name:
 *           type: string
 *           description: user name
 *         email:
 *           type: string
 *           description: user email
 *         password:
 *           type: string
 *           description: user password
 *         passwordConfirm:
 *           type: string
 *           description: user password
 *         role:
 *           type: string
 *           description: user role
 *       example:
 *         name: "João Silva"
 *         email: "joao.silva@email.com"
 *         password: 'test1234'
 *         passwordConfirm: 'test1234'
 *         role: 'tecnico'
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             email: 'email@example.com'
 *             password: 'test1234'
 *     responses:
 *       201:
 *         description: user created successfuly
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *              status: 'success'
 *              token: 'your jwt token'
 *              data: 'obj with user info'
 *
 *       400:
 *         description: bad request
 */

router.post('/login', authController.login);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: user created successfuly
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *              status: 'success'
 *              token: 'your jwt token'
 *              data: 'obj with user info'
 *       400:
 *         description: bad request
 */
router.post('/register', authController.register);

export default router;
