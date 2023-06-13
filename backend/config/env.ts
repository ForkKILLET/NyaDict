import { resolve } from 'path';
const isProd = process.env.NODE_ENV === 'production';

export const resolveEnv = () => (
  resolve(isProd ? '.env.prod' : '.env')
)
