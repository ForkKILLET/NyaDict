import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from './hashing.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActiveUserData } from './interfaces/active-user-data.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private user: Model<User>,
    private jwtService: JwtService,
    private hashingService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { name, password, invitationCode } = signUpDto;

    const existingUser = await this.user.findOne({ name });
    if (existingUser)
      throw new UnauthorizedException('ユーザー名が使用されました');

    if (invitationCode !== process.env.NYADICT_INVITATION_CODE)
      throw new UnauthorizedException('招待コードが正しくありません');

    const hashedPassword = await this.hashingService.hash(password);

    return this.user.create({
      ...signUpDto,
      password: hashedPassword,
    });
  }

  async signIn(signInDto: SignInDto) {
    const { name, password } = signInDto;

    const user = await this.user.findOne({ name });
    if (!user) throw new UnauthorizedException('ユーザーが存在しません');

    const isEqual = await this.hashingService.compare(password, user.password);
    if (!isEqual)
      throw new UnauthorizedException('パスワードが正しくありません');

    return await this.generateToken(user);
  }

  async generateToken(user: User) {
    const token = await this.signToken<Omit<ActiveUserData, 'sub'>>(user._id, {
      name: user.name,
    });
    return { token };
  }

  private async signToken<T>(userId: string, payload?: T) {
    return await this.jwtService.signAsync({
      sub: userId,
      ...payload,
    });
  }
}
