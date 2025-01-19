import {
  authMiddleware,
  requirePermissionsAtContext,
} from '../middleware/auth.js';
import GetAllTasksUseCase from '../../useCase/taskUseCases/getAllTasksUseCase.js';
import CreateTaskUseCase from '../../useCase/taskUseCases/createTaskUseCase.js';
import catchAsync from '../../utils/catchAsync.js';
import TaskService from '../../services/taskService.js';
import GetSpecificTasksUseCase from '../../useCase/taskUseCases/getSpecificTaskUseCase.js';
import TaskRepository from '../../repository/taskRepository.js';
import UpdateTasksUseCase from '../../useCase/taskUseCases/updateTaskUseCase.js';
import DeleteTasksUseCase from '../../useCase/taskUseCases/deleteTaskUseCase.js';
import CompleteTheTasksUseCase from '../../useCase/taskUseCases/completeTheTaskUseCase.js';

function formattedRes(data) {
  return {
    status: 'success',
    data,
  };
}

export default (app, baseUrl) => {
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

  app.get(
    `${baseUrl}/`,
    authMiddleware,
    requirePermissionsAtContext(/^read/, 'tasks'),
    catchAsync(async (req, res, next) => {
      const useCase = new GetAllTasksUseCase(TaskService);
      const tasks = await useCase.execute(req.user);
      res.status(200).json(formattedRes(tasks));
    })
  );

  app.post(
    `${baseUrl}/`,
    authMiddleware,
    requirePermissionsAtContext(/^create/, 'tasks'),
    catchAsync(async (req, res, next) => {
      const useCase = new CreateTaskUseCase(TaskService);
      const data = {
        title: req.body.title,
        description: req.body.description,
      };
      const task = await useCase.execute(data, req.user);
      res.status(201).json(formattedRes(task));
    })
  );

  app.get(
    `${baseUrl}/:taskId`,
    authMiddleware,
    requirePermissionsAtContext(/^read/, 'tasks'),
    catchAsync(async (req, res, next) => {
      const useCase = new GetSpecificTasksUseCase(TaskService, TaskRepository);
      const task = await useCase.execute(req.params.taskId, req.user);
      res.status(200).json(formattedRes(task));
    })
  );

  app.patch(
    `${baseUrl}/:taskId`,
    authMiddleware,
    requirePermissionsAtContext(/^update/, 'tasks'),
    catchAsync(async (req, res, next) => {
      const useCase = new UpdateTasksUseCase(TaskService, TaskRepository);
      const data = {
        taskId: req.params.taskId,
        title: req.body.title,
        description: req.body.description,
      };
      const task = await useCase.execute(data, req.user);

      res.status(200).json(formattedRes(task));
    })
  );

  app.delete(
    `${baseUrl}/:taskId`,
    authMiddleware,
    requirePermissionsAtContext(/^delete/, 'tasks'),
    catchAsync(async (req, res, next) => {
      const useCase = new DeleteTasksUseCase(TaskService, TaskRepository);
      await useCase.execute(req.params.taskId, req.user);
      res.status(204).json(formattedRes(null));
    })
  );

  app.patch(
    `${baseUrl}/complete-task/:taskId`,
    authMiddleware,
    requirePermissionsAtContext(/^update/, 'tasks'),
    catchAsync(async (req, res, next) => {
      const useCase = new CompleteTheTasksUseCase(TaskService, TaskRepository);
      const task = await useCase.execute(req.params.taskId, req.user);
      res.status(200).json(formattedRes(task));
    })
  );
};
