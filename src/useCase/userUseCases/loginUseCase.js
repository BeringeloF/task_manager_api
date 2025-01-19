import { singToken } from '../../utils/jwt.js';

class LoginUseCase {
  constructor(UserService, UserRepository) {
    this.userService = new UserService();
    this.userRepository = new UserRepository();
  }

  async execute(email, password) {
    const user = await this.userService.login(email, password);
    const permissions = await this.userRepository.getUserPermissions(
      user.user_id
    );
    const token = singToken({ id: user.user_id, permissions });
    return { user, token };
  }
}

export default LoginUseCase;
