import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';

export const createToken = (
  jwtPayload: { userId: string; role: string },
  secret: string,
  expiresIn: number | StringValue 
) => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(jwtPayload, secret, options);
};
