import { singToken } from '../../utils/jwt.js';

class RegisterNewUserUseCase {
  constructor(UserService, UserRepository) {
    this.userService = new UserService();
    this.userRepository = new UserRepository();
  }

  async execute(data) {
    console.log(this);
    const newUser = await this.userService.register(data);
    const permissions = await this.userRepository.getUserPermissions(
      newUser.user_id
    );
    console.log(newUser.name, permissions);
    const token = singToken({ id: newUser.user_id, permissions });
    return { newUser, token };
  }
}

export default RegisterNewUserUseCase;
