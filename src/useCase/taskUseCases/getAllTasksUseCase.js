import AppError from '../../utils/appError.js';

class GetAllTasksUseCase {
  constructor(TaskService) {
    this.taskService = new TaskService();
  }

  async execute(user) {
    try {
      return await this.taskService.getAllTasks(user.user_id, user.permission);
    } catch (err) {
      throw err;
    }
  }
}

export default GetAllTasksUseCase;
