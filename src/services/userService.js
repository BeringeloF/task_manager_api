import AppError from '../utils/appError.js';
import UserRepository from '../repository/userRepository.js';

class UserService {
  constructor() {
    this.repository = new UserRepository();
  }
  async register(data) {
    try {
      const newUser = await this.repository.create(
        data.name,
        data.email,
        data.password,
        data.passwordConfirm,
        data.role
      );

      return newUser;
    } catch (err) {
      throw err;
    }
  }

  async login(email, password) {
    try {
      const user = await this.repository.findByEmail(email);

      if (
        !user ||
        !(await this.repository.correctPassword(password, user.password))
      )
        throw new AppError('incorrect email or password', 400);
      delete user.password;
      return user;
    } catch (err) {
      throw err;
    }
  }
}

export default UserService;
