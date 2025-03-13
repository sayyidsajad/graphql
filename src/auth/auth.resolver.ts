import { Resolver, Mutation, Args, Subscription } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import { Role } from '@prisma/client';
import { pubSub } from 'src/pubsub';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  //   @Mutation(() => String)
  //   async signup(
  //     @Args('name') name: string,
  //     @Args('email') email: string,
  //     @Args('password') password: string,
  //     @Args('role', { defaultValue: 'USER' }) role: 'USER' | 'ADMIN',
  //   ): Promise<string> {
  //     await this.authService.signup(name, email, password, role);
  //     return 'User registered successfully';
  //   }

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    const { token } = await this.authService.login(email, password);
    return token;
  }

  @Mutation(() => User)
  async signup(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('role') role: Role,
  ): Promise<User> {
    const newUser = await this.authService.signup(name, email, password, role);
    await pubSub.publish('USER_CREATED', { userCreated: newUser });
    return newUser;
  }

  @Subscription(() => User, {
    resolve: (payload) => payload.userCreated,
  })
  userCreated() {
    return pubSub.asyncIterator('USER_CREATED');
  }
}
