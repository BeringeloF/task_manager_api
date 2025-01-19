class GetSpecificTasksUseCase {
  constructor(TaskService, TaskRepository) {
    this.taskService = new TaskService();
    this.TaskRepository = new TaskRepository();
  }

  async execute(taskId, user) {
    try {
      return await this.taskService.getTask(
        taskId,
        user.user_id,
        user.permission
      );
    } catch (err) {
      throw err;
    }
  }
}

export default GetSpecificTasksUseCase;
