import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import pool from '../db/db.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import validator from 'validator';

export const singToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    //Esta opcao serve para dizer por quanto tempo o token sera valido, ou seja assim que acabar a validade o user sera logout
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 *
 * @param {object} user userDocument
 * @param {number} statusCode
 * @param {object} res response Object
 * @param {boolean} sendResponse True by defualt. if false won´t send the response to the client
 *
 */
export const createSendToken = function (
  user,
  statusCode,
  res,
  sendResponse = true
) {
  const token = singToken(user.user_id);

  //Aqui nos iremos implementar cookies, eles sao texto que nos envimos com alguma informaçao sensivel que apenas o navegador pode acessar e nao pode ser modificado
  //Ex nosso json web token

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIES_EXPIRES_IN) * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  if (sendResponse) {
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  }
};

export const register = catchAsync(async (req, res, next) => {
  if (!validator.isEmail(req.body.email)) return next('invalid email', 400);
  const newUser = await User.create(
    req.body.name,
    req.body.email,
    req.body.password,
    req.body.passwordConfirm,
    req.body.role
  );

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //verify if email and password are exist
  if (!email || !password)
    return next(new AppError('missing email or password!', 400));
  console.log(email, password);
  const user = (
    await pool.query('SELECT * FROM users WHERE email = $1', [email])
  ).rows[0];

  console.log(user);

  //check if email exist and password is correct
  if (!user || !(await User.correctPassword(password, user.password)))
    return next(new AppError('incorrect email or password!', 400));

  // if everything is correct send access token
  createSendToken(user, 200, res);
});

export const logout = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 500),
    secure: true,
    httpOnly: true,
  };

  res.cookie('jwt', 'logout', cookieOptions);
  res.status(200).send('loging out');
});

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies?.jwt || req.headers['authorization']) {
    token = req.cookies?.jwt || req.headers['authorization'].split(' ')[1];
  }

  if (!token) return next(new AppError('you are not logged in!', 401));
  //verification token
  //Aqui nos iremos verificar se o token e valido usando o verify que aceita como primeiro argumento o token e segundo o secret
  //E como terceiro argumento uma callback function que é executada assim que sua acao for finalizada ou seja este verify é um aync method
  //como nos estamos usando async await nos podemos promissify este metodo
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user still exist
  const currentUser = (
    await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.id])
  ).rows[0];

  if (!currentUser)
    return next(
      new AppError('the user belonging to this token no loger exist', 401)
    );

  //granted access to the protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
