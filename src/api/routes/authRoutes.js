import LoginUseCase from '../../useCase/userUseCases/loginUseCase.js';
import catchAsync from '../../utils/catchAsync.js';
import RegisterNewUserUseCase from '../../useCase/userUseCases/registerNewUserUseCase.js';
import { setJwtCookie } from '../../utils/jwt.js';
import UserService from '../../services/userService.js';
import UserRepository from '../../repository/userRepository.js';

export default (app, baseUrl) => {
  /**
   * @swagger
   * components:
   *   schemas:
   *     User:
   *       type: object
   *       required:
   *         - name
   *         - email
   *         - password
   *         - passwordConfirm
   *       properties:
   *         user_id:
   *           type: integer
   *           description: user id
   *         name:
   *           type: string
   *           description: user name
   *         email:
   *           type: string
   *           description: user email
   *         password:
   *           type: string
   *           description: user password
   *         passwordConfirm:
   *           type: string
   *           description: user password
   *         role:
   *           type: string
   *           description: user role
   *       example:
   *         name: "João Silva"
   *         email: "joao.silva@email.com"
   *         password: 'test1234'
   *         passwordConfirm: 'test1234'
   *         role: 'tecnico'
   */

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: login
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *           example:
   *             email: 'email@example.com'
   *             password: 'test1234'
   *     responses:
   *       201:
   *         description: user created successfuly
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *             example:
   *              status: 'success'
   *              token: 'your jwt token'
   *              data: 'obj with user info'
   *
   *       400:
   *         description: bad request
   */

  app.post(
    `${baseUrl}/login`,
    catchAsync(async (req, res, next) => {
      const useCase = new LoginUseCase(UserService, UserRepository);
      const { user, token } = await useCase.execute(
        req.body.email,
        req.body.password
      );

      setJwtCookie(res, token);

      res.status(200).json({
        status: 'success',
        token,
        data: {
          user,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     summary: register a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       201:
   *         description: user created successfuly
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *             example:
   *              status: 'success'
   *              token: 'your jwt token'
   *              data: 'obj with user info'
   *       400:
   *         description: bad request
   */
  app.post(
    `${baseUrl}/register`,
    catchAsync(async (req, res, next) => {
      const useCase = new RegisterNewUserUseCase(UserService, UserRepository);
      const { newUser: user, token } = await useCase.execute(req.body);

      setJwtCookie(res, token);

      res.status(201).json({
        status: 'success',
        token,
        data: {
          user,
        },
      });
    })
  );
};
