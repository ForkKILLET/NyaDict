import { ActiveUserData } from './auth/interfaces/active-user-data.interface';

declare module 'fastify' {
  interface FastifyRequest {
    user: ActiveUserData;
  }
}
