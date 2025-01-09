import express from 'express';
import * as authController from '../controller/authController.js';
import * as taskController from '../controller/taskController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         task_id:
 *           type: string
 *           description: task id
 *         title:
 *           type: string
 *           description: task title
 *         description:
 *           type: string
 *           description: task description
 *         assignedTo:
 *           type: integer
 *           description: fk of user where role = 'tecnico'
 *         created_at:
 *           type: date
 *           description: user role
 *       example:
 *         task_id: 234
 *         title: 'fix something'
 *         description: 'to fix something you will need to first fix another thing'
 *         assignedTo: 12
 *         created_at: 2022-01-05 12:23 123

 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: array of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: unauthorized
 *
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: array of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: unauthorized
 *
 */

/**
 * @swagger
 * /api/v1/tasks/{taskId}:
 *   get:
 *     summary: get a specific task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *         required: true
 *         description: task id
 *     responses:
 *       200:
 *         description: the task with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found, it could be because this task does not exist, or you do not have access to this task
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: create a task
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description:  unauthorized
 */

/**
 * @swagger
 * /api/v1/tasks/{taskId}:
 *   patch:
 *     summary: update a task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *           example:
 *             title: 'new title'
 *             description: 'new description'
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *         required: true
 *         description: task id
 *     responses:
 *       200:
 *         description: task updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found, it could be because this task does not exist, or you do not have access to this task
 */

/**
 * @swagger
 * /api/v1/tasks/complete-task/{taskId}:
 *   patch:
 *     summary: complete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *         required: true
 *         description: task id
 *     responses:
 *       200:
 *         description: task completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *             example:
 *               task_id: 234
 *               title: 'fix something'
 *               description: 'to fix something you will need to first fix another thing'
 *               assignedTo: 12
 *               created_at: 2022-01-05 12:23 123
 *               completed_at: 2024-01-06 18:12 153
 *
 *
 *       404:
 *         description: Task not found, it could be because this task does not exist, or you do not have access to this task
 */

/**
 * @swagger
 * /api/v1/tasks/{taskId}:
 *   delete:
 *     summary: delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *         required: true
 *         description: task id
 *     responses:
 *       204:
 *         description: task deleted sucessfuly
 *
 *       404:
 *         description: Task not found, it could be because this task does not exist, or you do not have access to this task
 */

router.use(authController.protect);

router
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route('/:taskId')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

router.patch('/complete-task/:taskId', taskController.completeTheTask);

export default router;
