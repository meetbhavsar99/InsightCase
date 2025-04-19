import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { prismaError } from 'src/shared/filters/error-handling';
import * as appConfig from '../../appConfig.json';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    try {
      return await this.prisma.user.findMany();
    } catch (err) {
      prismaError(err);
    }
  }

  async getUserProfile(accessToken: string) {
    const url = appConfig.GRAPH_API_ROOT_URL + '/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    return await axios.get(url, { headers });
  }

  // async createCalendarEvent(userEmail: string, task: Task) {
  //   const accessToken = await this.getAccessToken(); // Retrieve Microsoft Graph API access token

  //   const event = {
  //     subject: `New Task: ${task.description}`,
  //     body: {
  //       contentType: 'HTML',
  //       content: `You have a new task due on ${task.due_date}. Description: ${task.description}`,
  //     },
  //     start: {
  //       dateTime: task.due_date.toISOString(),
  //       timeZone: 'UTC',
  //     },
  //     end: {
  //       dateTime: new Date(task.due_date.getTime() + 60 * 60 * 1000).toISOString(),
  //       timeZone: 'UTC',
  //     },
  //     attendees: [
  //       {
  //         emailAddress: {
  //           address: userEmail,
  //           name: 'Assigned Staff',
  //         },
  //         type: 'required',
  //       },
  //     ],
  //   };

  //   const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(event),
  //   });

  //   if (!response.ok) {
  //     throw new Error('Failed to create calendar event');
  //   }

  //   return response.json();
  // }
}
