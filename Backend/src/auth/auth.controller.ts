import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Req,
  HttpStatus,
  InternalServerErrorException,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

@ApiTags('User')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('check')
  async checkAuth(@Req() req: Request) {
    const isAuthenticated = await this.authService.validateUser(req);

    if (!isAuthenticated) {
      throw new UnauthorizedException('User is not authenticated');
    }

    return true;
  }

  @Get('azure')
  async redirectToAzure(@Res() res: Response) {
    const clientId = this.configService.get<string>('AZURE_CLIENT_ID');
    const tenantId = this.configService.get<string>('AZURE_TENANT_ID');
    const redirectUri = this.configService.get<string>('AZURE_REDIRECT_URI');
    const state = crypto.randomBytes(16).toString('hex'); // Optionally, track state for security

    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_mode=query&scope=openid profile email offline_access&state=${state}`;

    res.redirect(authUrl);
  }

  // @Get('callback')
  // async handleAzureCallback(
  //   @Query('code') code: string,
  //   @Query('state') state: string,
  //   @Req() req: any,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const clientId = this.configService.get<string>('AZURE_CLIENT_ID');
  //     const tenantId = this.configService.get<string>('AZURE_TENANT_ID');
  //     const clientSecret = this.configService.get<string>('AZURE_CLIENT_SECRET');
  //     const redirectUri = this.configService.get<string>('AZURE_REDIRECT_URI');

  //     // Exchange code for access token
  //     const tokenResponse = await axios.post(
  //       `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  //       new URLSearchParams({
  //         client_id: clientId,
  //         scope: 'openid profile email offline_access',
  //         code: code,
  //         redirect_uri: redirectUri,
  //         grant_type: 'authorization_code',
  //         client_secret: clientSecret,
  //       }).toString(),
  //       {
  //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //       },
  //     );

  //     const { access_token, id_token } = tokenResponse.data;

  //     // Decode the ID token to get user info
  //     const userInfo = parseJwt(id_token);

  //     // Set session or JWT cookie
  //     req.session.user = {
  //       id: userInfo.sub,
  //       email: userInfo.email,
  //       name: userInfo.name,
  //     };

  //     res.redirect('/dashboard'); // Redirect to the frontend dashboard
  //   } catch (error) {
  //     console.error('Error during Azure callback:', error.message);
  //     throw new HttpException('Authentication Failed', HttpStatus.UNAUTHORIZED);
  //   }
  // }

  // old auth
  @Post('signup')
  async signUp(
    @Body()
    dto: SignUpDto,
  ) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  async signIn(
    @Body()
    dto: SignInDto,
  ) {
    return this.authService.signIn(dto);
  }

  // new auth
  @Get('login')
  async login(@Res() res: Response): Promise<void> {
    const loginUrl = await this.authService.signInAuth();
    res.redirect(loginUrl);
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService
      .signOut(req)
      .then((status) => {
        let message = 'Logged out successfully.';

        // If the user token wasn't found, we consider the user not logged in.
        if (status === HttpStatus.BAD_REQUEST) {
          message = 'User not logged in.';
        }

        res.status(status).send({ message: message });
      })
      .catch((error) => {
        const errMessage = 'Error logging out: ' + error.message;
        throw new InternalServerErrorException(errMessage);
      });
  }

  @Get('callback')
  async callback(
    @Req() req: Request,
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.handleRedirect(req, code);

    // Get the original destination URL from the session or return '/'.
    // const redirectUrl = await this.authService.getAfterLoginRedirect(req);
    const redirectUrl = 'http://localhost:3000';
    // const redirectUrl = '/';

    // Delete AfterLoginRedirect from Session. Awaiting for Async process not required.
    this.authService.deleteAfterLoginRedirect(req);

    // Redirect user back to their original destination.
    res.redirect(redirectUrl);
  }
}
