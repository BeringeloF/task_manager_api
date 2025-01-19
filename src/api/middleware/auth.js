import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AppError from '../../utils/appError.js';
import UserRepository from '../../repository/userRepository.js';

export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.jwt || req.headers['authorization']) {
      token = req.cookies?.jwt || req.headers['authorization'].split(' ')[1];
    }

    if (!token) return next(new AppError('you are not logged in!', 401));

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const userRepository = new UserRepository();

    //check if the user still exist
    const currentUser = await userRepository.findById(decoded.id);

    if (!currentUser)
      return next(
        new AppError('the user belonging to this token no loger exist', 401)
      );

    currentUser.permissions = decoded.permissions;
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

export const requirePermissionsAtContext = (permission, context) => {
  return (req, res, next) => {
    const index = req.user.permissions.findIndex((obj, i) => {
      return permission.test(obj.action) && obj.context === context;
    });
    if (index === -1) {
      return next(
        new AppError('you do not have permission to perform this action', 403)
      );
    }
    req.user.permission = req.user.permissions[index].action;
    return next();
  };
};
