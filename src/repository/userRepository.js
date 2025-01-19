import pool from '../db/db.js';
import bcrypt from 'bcryptjs';
import AppError from '../utils/appError.js';

class UserRepository {
  constructor() {
    this.db = pool;
  }
  async create(name, email, password, passwordConfirm, role) {
    let client;
    try {
      if (password !== passwordConfirm)
        throw new AppError('passwords do not match!', 400);
      const hashedPassword = await bcrypt.hash(password, 12);
      client = await this.db.connect();
      await client.query('BEGIN');
      const result = (
        await client.query(
          'INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING user_id, name, email',
          [name, email, hashedPassword]
        )
      ).rows[0];
      const role_id = (
        await client.query('SELECT role_id FROM roles WHERE name = $1', [role])
      ).rows[0]?.role_id;

      console.log('role_Id', role_id);

      await client.query(
        'INSERT INTO user_roles (role_id, user_id) VALUES($1, $2)',
        [role_id || 1, result.user_id]
      );
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client?.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findByEmail(email) {
    try {
      const user = (
        await this.db.query('SELECT * FROM users WHERE email = $1', [email])
      ).rows[0];
      return user;
    } catch (err) {
      throw err;
    }
  }

  async getUserPermissions(id) {
    try {
      const permissions = (
        await this.db.query(
          `
      SELECT p.action, p.context FROM main_schema.permissions p
      JOIN main_schema.role_permissions rp ON rp.permission_id = p.permission_id
      JOIN main_schema.user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = $1
        `,
          [id]
        )
      ).rows;
      return permissions;
    } catch (err) {
      throw err;
    }
  }

  async getManagersEmails() {
    try {
      const query = `SELECT email FROM user_roles ur
JOIN roles ON ur.role_id = roles.role_id
JOIN users ON users.user_id = ur.user_id
WHERE roles.name = 'manager'`;
      return (await this.db.query(query)).rows;
    } catch (err) {
      console.log(err);
    }
  }

  async correctPassword(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }

  async findById(id) {
    return (await this.db.query(`SELECT * FROM users WHERE user_id = $1`, [id]))
      .rows[0];
  }
}

export default UserRepository;
