import AppError from '../../utils/appError.js';

class UpdateTasksUseCase {
  constructor(TaskService, TaskRepository) {
    this.taskService = new TaskService();
    this.taskRepository = new TaskRepository();
  }

  async execute(data, user) {
    try {
      return await this.taskService.updateTask(data, user.user_id);
    } catch (err) {
      throw err;
    }
  }
}

export default UpdateTasksUseCase;
