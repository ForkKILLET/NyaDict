import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import { FastifyRequest } from 'fastify'
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator'
import { REQUEST_USER_KEY } from 'src/constants'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler())
    if (isPublic)
      return true

    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const token = this.extractTokenFromHeader(request)
    if (! token)
      throw new UnauthorizedException('アクセスにはログインが必要です')

    try {
      const payload = await this.jwtService.verifyAsync(token)
      request[REQUEST_USER_KEY] = payload
    }
    catch (error) {
      throw new UnauthorizedException('不正ログインです')
    }
    return true
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? []
    return token
  }
}
