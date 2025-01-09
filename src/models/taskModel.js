import pool from '../db/db.js';
import AppError from '../utils/appError.js';

const filterForfalsyValue = (columns, values) => {
  const orginalLength = columns.length;
  let i = 0;
  while (values.some((el) => !el)) {
    if (!values[i]) {
      values.splice(i, 1);
      columns.splice(i, 1);
      console.log(i, columns, values);
    } else {
      i++;
    }
  }

  return [columns, values];
};

class Task {
  static async create(values, assignedTo) {
    try {
      const isManager = (
        await pool.query(
          'SELECT user_id FROM users WHERE user_id = $1 AND role = $2',
          [assignedTo, 'gerente']
        )
      ).rows[0];

      console.log('MANAGER', isManager);

      if (isManager)
        throw new AppError('a task cannot be assigned to a manager', 403);
      return (
        await pool.query(
          'INSERT INTO tasks(title, description, assigned_to) VALUES($1, $2, $3) RETURNING *',
          [...values, assignedTo]
        )
      ).rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async findById(taskId, isTecnicoId) {
    try {
      if (isTecnicoId) {
        return (
          await pool.query(
            `SELECT * FROM tasks WHERE task_id = $1 AND assigned_to = $2`,
            [taskId, isTecnicoId]
          )
        ).rows[0];
      }
      return (
        await pool.query(`SELECT * FROM tasks WHERE task_id = $1`, [taskId])
      ).rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async findByIdAndUpdate(taskId, values, isTecnicoId) {
    try {
      let columns = ['title', 'description'];

      [columns, values] = filterForfalsyValue(columns, values);

      columns = columns.map((col, i) => {
        return `${col} = $${i + 1}`;
      });
      const qntColumns = columns.length;
      columns = columns.join(', ');

      if (values.length === 0)
        throw new AppError('no valid value was specified', 400);

      const ifNotManager = `AND assigned_to = $${qntColumns + 2}`;

      if (isTecnicoId) {
        return (
          await pool.query(
            `UPDATE tasks SET ${columns} WHERE task_id = $${
              qntColumns + 1
            } ${ifNotManager}
                 RETURNING *`,
            [...values, taskId, isTecnicoId]
          )
        ).rows[0];
      }
      return (
        await pool.query(
          `UPDATE tasks SET ${columns} WHERE task_id = $${
            qntColumns + 1
          } RETURNING *`,
          [...values, taskId]
        )
      ).rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async findAll(isTecnicoId) {
    try {
      if (isTecnicoId) {
        return (
          await pool.query(`SELECT * FROM tasks WHERE assigned_to = $1`, [
            isTecnicoId,
          ])
        ).rows;
      }
      return (await pool.query(`SELECT * FROM tasks`)).rows;
    } catch (err) {
      throw err;
    }
  }

  static async delete(taskId, isTecnicoId) {
    try {
      if (isTecnicoId) {
        return (
          await pool.query(
            'DELETE FROM tasks WHERE task_id = $1 AND assigned_to = $2',
            [taskId, isTecnicoId]
          )
        ).rowCount;
      }
      return (
        await pool.query('DELETE FROM tasks WHERE task_id = $1', [taskId])
      ).rowCount;
    } catch (err) {
      throw err;
    }
  }

  static async markTaskAsCompleted(taskId, tecnicoId) {
    let client;
    try {
      const date = new Date();

      client = await pool.connect();
      await client.query('BEGIN');

      const isTaskCompleted = (
        await client.query(
          'SELECT completed_at FROM tasks WHERE task_id = $1 AND assigned_to = $2 AND completed_at IS NOT NULL',
          [taskId, tecnicoId]
        )
      ).rows[0];

      if (isTaskCompleted)
        throw new AppError(
          `this task was alredy marked as completed at the date ${isTaskCompleted.completed_at}`,
          403
        );

      const result = (
        await client.query(
          `UPDATE tasks SET completed_at = $1 WHERE task_id = $2 AND assigned_to = $3 RETURNING *`,
          [date.toISOString(), taskId, tecnicoId]
        )
      ).rows[0];

      await client.query('COMMIT');

      return result;
    } catch (err) {
      await client?.query('ROLLBACK');
      throw err;
    } finally {
      client?.release();
    }
  }
}

export default Task;
