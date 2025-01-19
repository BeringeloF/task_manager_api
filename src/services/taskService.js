import AppError from '../utils/appError.js';
import { publishEmailTask } from '../workerAndQueues/new_task.js';
import { processEmailQueue } from '../workerAndQueues/worker.js';
import TaskRepository from '../repository/taskRepository.js';
import UserRepository from '../repository/userRepository.js';

class TaskService {
  constructor() {
    this.repository = new TaskRepository();
  }
  async getAllTasks(userId, permission) {
    try {
      const tasks = await this.repository.findAll(userId, permission);
      return tasks;
    } catch (err) {
      throw err;
    }
  }
  async updateTask(data, tecnicoId) {
    try {
      const task = await this.repository.update(data, tecnicoId);

      if (!task)
        return next(
          new AppError('the task you are trying to update does not exist', 404)
        );

      return task;
    } catch (err) {
      throw err;
    }
  }

  async getTask(taskId, userId, permission) {
    try {
      const task = await this.repository.findById(taskId, userId, permission);

      if (!task) return next(new AppError('this task does not exist', 404));

      return task;
    } catch (err) {
      throw err;
    }
  }

  async createTask(data, userId) {
    try {
      const task = await this.repository.create(data, userId);

      return task;
    } catch (err) {
      throw err;
    }
  }

  async completeTheTask(taskId, user) {
    try {
      const date = new Date();
      const task = await this.repository.markTaskAsCompleted(
        taskId,
        user.user_id,
        date
      );

      if (!task)
        throw new AppError(
          'We could not find any task created/assigned by you with the specified task_id. Please ensure that you are the creator of the task or have manager privileges.',
          404
        );

      const msg =
        user.role === 'tecnico'
          ? `O tecnico ${user.name} realizou a tarefa ${
              task.title
            } na data ${getFormatedDate(date)}`
          : `o gerente ${user.name} marcou a tarefa ${task.title} como comcluida`;

      manageEmailWorkflow(msg, task.taskId);

      return task;
    } catch (err) {
      throw err;
    }
  }

  async deleteTask(taskId) {
    try {
      const rowCount = await this.repository.delete(taskId);

      if (rowCount === 0)
        throw new AppError(
          'the task you are trying to delete does not exist',
          404
        );

      return rowCount;
    } catch (err) {
      throw err;
    }
  }
}

async function manageEmailWorkflow(msg, taskId) {
  try {
    const userRepository = new UserRepository();
    const emails = await userRepository.getManagersEmails();
    if (emails.length === 0) return;
    processEmailQueue('worker 1');
    processEmailQueue('worker 2');
    emails.forEach((email) => publishEmailTask(email.email, msg, taskId));
  } catch (err) {
    console.log(err);
  }
}

function getFormatedDate(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  const hora = String(date.getHours()).padStart(2, '0');
  const minuto = String(date.getMinutes()).padStart(2, '0');

  return `${ano}-${mes}-${dia} ${hora}:${minuto}`;
}

export default TaskService;
