import pool from '../db/db.js';
import bcrypt from 'bcryptjs';
import AppError from '../utils/appError.js';

class User {
  static async create(name, email, password, passwordConfirm, role) {
    try {
      if (password !== passwordConfirm)
        throw new AppError('passwords do not match!', 400);
      const hashedPassword = await bcrypt.hash(password, 12);
      return (
        await pool.query(
          'INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING user_id, name, email, role',
          [name, email, hashedPassword, role || 'tecnico']
        )
      ).rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async correctPassword(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }

  static async findById(id, columns) {
    return (
      await pool.query(
        `SELECT ${columns ? columns : '*'} FROM users WHERE user_id = $1`,
        [id]
      )
    ).rows[0];
  }
}

export default User;
