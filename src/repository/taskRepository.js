import pool from '../db/db.js';
import AppError from '../utils/appError.js';
import formatQuery from '../db/queryFormatter.js';

class TaskRepository {
  constructor() {
    this.db = pool;
  }
  async create(data, tecnicoId) {
    try {
      return (
        await this.db.query(
          'INSERT INTO tasks(title, description, created_by) VALUES($1, $2, $3) RETURNING *',
          [data.title, data.description, tecnicoId]
        )
      ).rows[0];
    } catch (err) {
      throw err;
    }
  }

  async findById(taskId, userId, permission) {
    try {
      const formatQueryObj = new formatQuery();
      const [query, values] = formatQueryObj.format(
        `SELECT * FROM tasks WHERE task_id = $1`,
        permission,
        [taskId, userId]
      );
      return (await this.db.query(query, values)).rows[0];
    } catch (err) {
      throw err;
    }
  }

  async update(data, tecnicoId) {
    try {
      let columns = [];
      const values = [];
      const taskId = data.taskId;
      delete data.taskId;

      Object.entries(data).forEach((el, i) => {
        if (el[1]) {
          columns.push(`${el[0]} = $${i + 1}`);
          values.push(el[1]);
        }
      });

      return (
        await this.db.query(
          `UPDATE tasks SET ${columns.join(', ')} WHERE task_id = $${
            values.length + 1
          } AND created_by = $${values.length + 2}
                 RETURNING *`,
          [...values, taskId, tecnicoId]
        )
      ).rows[0];
    } catch (err) {
      throw err;
    }
  }

  async findAll(userId, permission) {
    try {
      const formatQueryObj = new formatQuery();
      const [query, values] = formatQueryObj.format(
        `SELECT * FROM tasks`,
        permission,
        [userId]
      );
      return (await this.db.query(query, values)).rows;
    } catch (err) {
      throw err;
    }
  }

  async delete(taskId) {
    try {
      return (
        await this.db.query('DELETE FROM tasks WHERE task_id = $1', [taskId])
      ).rowCount;
    } catch (err) {
      throw err;
    }
  }

  async markTaskAsCompleted(taskId, tecnicoId, date) {
    let client;
    try {
      client = await this.db.connect();
      await client.query('BEGIN');

      const result = (
        await client.query(
          `UPDATE tasks SET completed_at = $1 WHERE task_id = $2 AND created_by = $3 RETURNING *`,
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

export default TaskRepository;
