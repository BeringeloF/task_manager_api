import AppError from '../../utils/appError.js';

class DeleteTasksUseCase {
  constructor(TaskService, TaskRepository) {
    this.taskService = new TaskService();
    this.taskRepository = new TaskRepository();
  }

  async execute(taskId, user) {
    try {
      await this.taskService.deleteTask(taskId);
    } catch (err) {
      throw err;
    }
  }
}

export default DeleteTasksUseCase;
