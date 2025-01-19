import AppError from '../../utils/appError.js';

class CompleteTheTasksUseCase {
  constructor(TaskService, TaskRepository) {
    this.taskService = new TaskService();
    this.taskRepository = new TaskRepository();
  }

  async execute(taskId, user) {
    try {
      const isTaskCompleted = (
        await this.taskRepository.findById(taskId, user.user_id, 'readAll')
      ).completed_at;

      if (isTaskCompleted)
        throw new AppError('this task was alredy completed', 403);

      return await this.taskService.completeTheTask(taskId, user);
    } catch (err) {
      throw err;
    }
  }
}

export default CompleteTheTasksUseCase;
