import jwt from 'jsonwebtoken';

export const singToken = (obj) => {
  return jwt.sign(obj, process.env.JWT_SECRET, {
    //Esta opcao serve para dizer por quanto tempo o token sera valido, ou seja assim que acabar a validade o user sera logout
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const setJwtCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIES_EXPIRES_IN) * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };
  res.cookie('jwt', token, cookieOptions);
};
