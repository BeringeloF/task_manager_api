import pool from '../db/db.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { publishEmailTask } from '../workerAndQueues/new_task.js';
import Task from '../models/taskModel.js';
import { processEmailQueue } from '../workerAndQueues/worker.js';

export const getAllTasks = catchAsync(async (req, res, next) => {
  let isTecnicoId = req.user.role === 'tecnico' ? req.user.user_id : false;

  const tasks = await Task.findAll(isTecnicoId);

  res.status(200).json({
    status: 'success',
    data: tasks,
  });
});

export const getTask = catchAsync(async (req, res, next) => {
  let isTecnicoId = req.user.role === 'tecnico' ? req.user.user_id : false;
  const task = await Task.findById(req.params.taskId, isTecnicoId);

  if (!task)
    return next(
      new AppError(
        'We could not find any task created/assigned by you with the specified task_id. Please ensure that you are the creator of the task or have manager privileges.',
        404
      )
    );

  res.status(200).json({
    status: 'success',
    data: task,
  });
});
export const createTask = catchAsync(async (req, res, next) => {
  const values = [req.body.title, req.body.description];

  const task = await Task.create(
    values,
    req.user.role === 'gerente' ? req.body.assignedTo : req.user.user_id
  );

  res.status(201).json({
    status: 'success',
    data: task,
  });
});

const getFormatedDate = (date) => {
  const ano = date.getFullYear(); // Ano
  const mes = String(date.getMonth() + 1).padStart(2, '0'); // Mês (0-11, então somamos 1)
  const dia = String(date.getDate()).padStart(2, '0'); // Dia
  const hora = String(date.getHours()).padStart(2, '0'); // Hora
  const minuto = String(date.getMinutes()).padStart(2, '0'); // Minuto

  return `${ano}-${mes}-${dia} ${hora}:${minuto}`;
};

const getManagersEmail = async () => {
  try {
    return (
      await pool.query('SELECT email FROM users WHERE role = $1', ['gerente'])
    ).rows;
  } catch (err) {
    console.log(err);
  }
};

export const manageEmailWorkflow = async (msg, taskId) => {
  const emails = await getManagersEmail();
  if (emails.length === 0) return;
  processEmailQueue('worker 1');
  processEmailQueue('worker 2');
  emails.forEach((email) => publishEmailTask(email.email, msg, taskId));
};

export const completeTheTask = catchAsync(async (req, res, next) => {
  const task = await Task.markTaskAsCompleted(
    req.params.taskId,
    req.user.role === 'gerente' ? req.body.assignedTo : req.user.user_id
  );

  if (!task)
    return next(
      new AppError(
        'We could not find any task created/assigned by you with the specified task_id. Please ensure that you are the creator of the task or have manager privileges.',
        404
      )
    );

  const msg =
    req.user.role === 'tecnico'
      ? `O tecnico ${req.user.name} realizou a tarefa ${
          task.title
        } na data ${getFormatedDate(new Date())}`
      : `o gerente ${req.user.name} marcou a tarefa ${task.title} como comcluida`;

  manageEmailWorkflow(msg, req.params.taskId);

  res.status(200).json({
    status: 'success',
    data: task,
  });
});

export const updateTask = catchAsync(async (req, res, next) => {
  let isTecnicoId = req.user.role === 'tecnico' ? req.user.user_id : false;

  const values = [req.body.title, req.body.description];

  const task = await Task.findByIdAndUpdate(
    req.params.taskId,
    values,
    isTecnicoId
  );

  if (!task)
    return next(
      new AppError(
        'We could not find any task created/assigned by you with the specified task_id. Please ensure that you are the creator of the task or have manager privileges.',
        404
      )
    );

  res.status(200).json({
    status: 'success',
    data: task,
  });
});

export const deleteTask = catchAsync(async (req, res, next) => {
  let isTecnicoId = req.user.role === 'tecnico' ? req.user.user_id : false;

  //Task.delete(taskId, manager);

  const rowCount = await Task.delete(req.params.taskId, isTecnicoId);

  if (rowCount === 0)
    return next(
      new AppError(
        'We could not find any task created/assigned by you with the specified task_id. Please ensure that you are the creator of the task or have manager privileges.',
        404
      )
    );
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
