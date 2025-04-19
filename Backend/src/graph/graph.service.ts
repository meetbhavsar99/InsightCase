import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as appConfig from 'appConfig.json';
import axios from 'axios';
@Injectable()
export class GraphService {
  // Method to get an access token for Microsoft Graph API
  async getAccessToken(req: Request): Promise<string> {
    const token = req.session?.token;
    console.log(token, 'tkn');
    if (!token) {
      throw new UnauthorizedException('Access token not found in session.');
    }
    return token;
  }

  async patchMicrosoftResource(endpoint: string, data: any, accessToken: string) {
    try {
      await axios.patch(endpoint, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.log(error, 'errsad');
      // throw new UnauthorizedException(`Failed to update Microsoft resource: ${error.message}`);
    }
  }

  // Method to create a To Do list for a staff member
  async createToDoList(access_token: string, listName: string): Promise<string> {
    const endpoint = `${appConfig.GRAPH_API_ROOT_URL}/me/todo/lists`;
    const response = await axios.post(
      endpoint,
      { displayName: listName },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.id; // Return the list ID
  }

  // Method to add a task to a specific To Do list
  async addTaskToToDoList(
    access_token: string,
    listId: string,
    title: string,
    dueDateTime: string,
  ) {
    const endpoint = `${appConfig.GRAPH_API_ROOT_URL}/me/todo/lists/${listId}/tasks`;
    const response = await axios.post(
      endpoint,
      {
        title,
        dueDateTime: {
          dateTime: dueDateTime,
          timeZone: 'UTC',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.id;
  }

  async addEventToCalendar(accessToken: string, eventDetails: any) {
    const endpoint = `${appConfig.GRAPH_API_ROOT_URL}/me/events`;

    const response = await axios.post(endpoint, eventDetails, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.id;
  }

  async getAllCalendarEvents(access_token: string): Promise<any[]> {
    const endpoint = `${appConfig.GRAPH_API_ROOT_URL}/me/events`;

    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.value;
    } catch (err) {
      throw new Error(`Failed to fetch calendar events: ${err.message}`);
    }
  }
}
