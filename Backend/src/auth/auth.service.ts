import { ForbiddenException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import * as dotenv from 'dotenv';
import {
  AuthenticationResult,
  ConfidentialClientApplication,
  Configuration,
} from '@azure/msal-node';
import { ConfigService } from '@nestjs/config';
import * as appConfig from '../../appConfig.json';
import { Request } from 'express';
import axios from 'axios';
import { GraphService } from 'src/graph/graph.service';
dotenv.config();

@Injectable()
export class AuthService {
  // ConfidentialClientApplication is used for WebApp and WebAPI scenarios. See MSAL-Node docs for more info.
  private msalClient: ConfidentialClientApplication;
  private readonly graphService: GraphService;
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    // Setting ConfigService to infer environment variables types to prevent TypeScript errors.
    private configService: ConfigService<
      {
        AZURE_CLIENT_ID: string;
        AZURE_TENANT_ID: string;
        AZURE_CLIENT_SECRET: string;
        AZURE_REDIRECT_URI: string;
      },
      true
    >,
  ) {
    const msalConfig: Configuration = {
      auth: {
        clientId: this.configService.get<string>('AZURE_CLIENT_ID', {
          // Infer the type of the environment variable from the types set in constructor. Prevents TypeScript error.
          infer: true,
        }),
        authority: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
        clientSecret: this.configService.get<string>('AZURE_CLIENT_SECRET', {
          infer: true,
        }),
      },
    };
    this.msalClient = new ConfidentialClientApplication(msalConfig);
  }

  // my new auth using microsoft graph api
  async signInAuth(): Promise<string> {
    const authUrlParameters = {
      scopes: appConfig.AZURE_SCOPES,
      redirectUri: this.configService.get<string>('AZURE_REDIRECT_URI', {
        infer: true,
      }),
    };

    const response = await this.msalClient.getAuthCodeUrl(authUrlParameters);
    console.log(response, 'res');
    return response;
  }

  async handleRedirect(req: Request, code: string): Promise<AuthenticationResult> {
    const tokenRequest = {
      code: code,
      scopes: appConfig.AZURE_SCOPES,
      redirectUri: this.configService.get<string>('AZURE_REDIRECT_URI', {
        infer: true,
      }),
    };

    // Code is received in the URL from Redirection URI. MSAL then handles the exchange of code for token.
    const response = await this.msalClient.acquireTokenByCode(tokenRequest);

    console.log(response, 'response');

    req.session.token = response.accessToken;

    console.log(req.session.token, 'gasd');

    // Log user sign in.
    if (response.account) console.log(response.account.username + ' sign in successful.');
    else console.log('Unknown User sign in successful.');

    return response;
  }

  async signOut(req: any): Promise<HttpStatus> {
    return new Promise((resolve, reject) => {
      // If no token, user is not signed in.
      if (!req.session.token) resolve(HttpStatus.BAD_REQUEST);

      // Destroy user session to log out.
      req.session.destroy((err) => {
        if (err) {
          reject(new Error(err.message));
        }
      });

      resolve(HttpStatus.OK);
    });
  }

  async validateMicrosoftToken(token: any): Promise<boolean> {
    try {
      const msalResponse = await this.msalClient.acquireTokenSilent({
        account: token,
        scopes: appConfig.AZURE_SCOPES,
      });
      return !!msalResponse;
    } catch {
      throw new UnauthorizedException('Invalid Microsoft token');
    }
  }

  async getAfterLoginRedirect(req: Request): Promise<string> {
    return req.session.afterLoginRedirect || '/user';
  }

  async deleteAfterLoginRedirect(req: Request): Promise<void> {
    delete req.session.afterLoginRedirect;
  }

  // my old auth
  async signUp(dto: SignUpDto) {
    const { name, email, password, role } = dto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    delete user.password;

    return {
      ...user,
    };
  }

  async signIn(dto: SignInDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    delete user.password;

    const token = this.generateToken(user);

    if (token?.access_token?.length > 0) {
      return { access_token: token.access_token, ...user };
    }
  }

  // Generate JWT token
  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload, {
        privateKey: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES,
      }),
    };
  }

  async validateUser(req: Request) {
    try {
      // const access_token = await this.graphService.getAccessToken(req);

      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${req.session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      return false;
    } catch (error) {
      console.error('Token validation failed:', error.message);
      throw new ForbiddenException('User not authenticated');
    }
  }
}
