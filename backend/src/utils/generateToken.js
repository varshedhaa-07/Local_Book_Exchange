import jwt from 'jsonwebtoken';
import jwtSecret from '../config/jwt.js';

export const generateToken = (userId) => jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
