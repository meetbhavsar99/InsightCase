import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check if the request has a valid JWT token
    const jwtAuthenticated = await this.jwtAuthGuard.canActivate(context);

    if (jwtAuthenticated) {
      // Manually validate and set the user from JWT
      const jwtUser = request.user;
      if (jwtUser) {
        // const user = await this.prisma.user.findUnique({
        //   where: { id: jwtUser.sub },
        // });
        // if (user) {
        //   request.user = user;
        return true;
      }
      //   }
      return false;
    }

    // If no JWT token, check for Microsoft session AccountInfo
    if (request.session && request.session.account) {
      console.log('Session account:', request.session.account); // Debug log
      try {
        // Validate using AccountInfo
        const microsoftAuthenticated = await this.authService.validateMicrosoftToken(
          request.session.account,
        );

        if (microsoftAuthenticated) {
          // Optionally, set user on request based on Microsoft account
          // Assuming you have a way to map Microsoft account to your User
          //   const user = await this.prisma.user.findUnique({
          //     where: { email: request.session.account.username }, // Adjust as needed
          //   });

          //   if (user) {
          // request.user = user;
          return true;
        } else {
          // Optionally, create a user if they don't exist
          throw new UnauthorizedException('User not found in the system');
        }
        // }
      } catch (error) {
        console.error('Microsoft authentication error:', error);
        throw new UnauthorizedException('Invalid Microsoft session token');
      }
    }

    // If neither JWT nor Microsoft token is valid, deny access
    throw new UnauthorizedException('Unauthorized');
  }
}
