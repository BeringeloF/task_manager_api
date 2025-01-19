import AppError from '../../utils/appError.js';

class CreateTaskUseCase {
  constructor(TaskService) {
    this.taskService = new TaskService();
  }

  async execute(data, user) {
    try {
      return await this.taskService.createTask(data, user.user_id);
    } catch (err) {
      throw err;
    }
  }
}

export default CreateTaskUseCase;
