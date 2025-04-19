import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { prismaError } from 'src/shared/filters/error-handling';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { GraphService } from 'src/graph/graph.service';
import { Request } from 'express';
import axios from 'axios';
import { Task } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphService: GraphService,
  ) {}

  async getAllTasks() {
    try {
      return await this.prisma.task.findMany({ include: { staff: true } });
    } catch (err) {
      prismaError(err);
    }
  }

  async getTask(id: string) {
    try {
      return await this.prisma.task.findFirst({
        where: {
          id,
        },
      });
    } catch (err) {
      prismaError(err);
    }
  }

  async getTasksByUser(id: string) {
    try {
      return await this.prisma.task.findMany({
        where: {
          staff_id: id,
        },
      });
    } catch (err) {
      prismaError(err);
    }
  }

  async createTask(dto: CreateTaskDto, req: Request) {
    try {
      const { due_date: _due_date, ...otherData } = dto;
      const due_date = new Date(dto.due_date).toISOString();

      // Get access token for Microsoft Graph API
      const accessToken = await this.graphService.getAccessToken(req);

      // Step 1: Fetch existing tasks for the case
      const existingTask = await this.prisma.task.findFirst({
        where: { case_id: dto.case_id, microsoft_list_id: { not: null } },
        include: { case: { include: { client: true } } },
      });

      let listId: string;

      if (existingTask) {
        // Use the existing list ID
        listId = existingTask.microsoft_list_id;
      } else {
        // Step 2: Create a new To-Do list if no existing list is found
        const listName = `Task for Client - ${existingTask.case.client.first_name} ${existingTask.case.client.last_name}`; // Customize the list name
        listId = await this.graphService.createToDoList(accessToken, listName);
      }

      // Step 3: Create a new To-Do task in the determined list
      const toDoTaskId = await this.graphService.addTaskToToDoList(
        accessToken,
        listId,
        dto.description,
        due_date,
      );

      // Step 4: Create a new calendar event
      const calendarEventDetails = this.constructCalendarEventDetails({
        ...dto,
        due_date,
        case: {
          client: existingTask.case.client,
        },
      });
      const calendarEventId = await this.graphService.addEventToCalendar(
        accessToken,
        calendarEventDetails,
      );

      // Step 5: Create task in the local database
      return await this.prisma.task.create({
        data: {
          ...otherData,
          due_date,
          microsoft_todo_id: toDoTaskId,
          microsoft_list_id: listId,
          microsoft_calendar_event_id: calendarEventId,
        },
      });
    } catch (err) {
      prismaError(err);
    }
  }

  async updateTaskCompletionStatus(taskId: string, dto: UpdateTaskDto, req: Request) {
    // Fetch the task details
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        case: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const accessToken = await this.graphService.getAccessToken(req);
    let updatedTask: Task;

    // Handle completion status
    if (dto?.is_complete === true || dto.description || dto.due_date) {
      if (task.microsoft_calendar_event_id) {
        await this.deleteMicrosoftCalendarEvent(task.microsoft_calendar_event_id, accessToken);
        await this.prisma.task.update({
          where: { id: taskId },
          data: { microsoft_calendar_event_id: null },
        });
      }

      if (dto.is_complete === false) {
        const eventDetails = this.constructCalendarEventDetails({
          ...task,
          description: dto.description || task.description,
          due_date: dto.due_date || task.due_date,
        });
        const eventId = await this.graphService.addEventToCalendar(accessToken, eventDetails);

        await this.prisma.task.update({
          where: { id: taskId },
          data: { microsoft_calendar_event_id: eventId },
        });
      }
    } else if (!task.microsoft_calendar_event_id) {
      // Create a calendar event if not complete
      const eventDetails = this.constructCalendarEventDetails({
        ...task,
        description: dto.description || task.description,
        due_date: dto.due_date || task.due_date,
      });
      const eventId = await this.graphService.addEventToCalendar(accessToken, eventDetails);

      await this.prisma.task.update({
        where: { id: taskId },
        data: { microsoft_calendar_event_id: eventId },
      });
    }

    // Update the task's details
    updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        is_complete: dto.is_complete,
        completed_at: dto.is_complete ? new Date(Date.now()).toISOString() : null,
        description: dto.description || task.description,
        due_date: dto.due_date ? new Date(dto.due_date).toISOString() : task.due_date,
      },
    });

    // Update Microsoft To-Do task if exists
    if (task.microsoft_todo_id) {
      await this.graphService.patchMicrosoftResource(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${task.microsoft_list_id}/tasks/${task.microsoft_todo_id}`,
        {
          title: dto.description || task.description,
          dueDateTime: dto.due_date
            ? { dateTime: new Date(dto.due_date).toISOString(), timeZone: 'UTC' }
            : undefined,
          status: dto.is_complete ? 'completed' : 'notStarted',
        },
        accessToken,
      );
    }

    return updatedTask;
  }

  private async deleteMicrosoftCalendarEvent(calendarEventId: string, accessToken: string) {
    const endpoint = `https://graph.microsoft.com/v1.0/me/events/${calendarEventId}/cancel`;
    await axios.post(
      endpoint,
      {
        comment:
          'This event is being canceled because the task has been marked as completed or there are changes in the task',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  private constructCalendarEventDetails(task: any) {
    return {
      subject: `${task.description}`,
      body: {
        contentType: 'HTML',
        content:
          task.description +
            ' for client - ' +
            task.case.client.first_name +
            ' ' +
            task.case.client.last_name || 'No description available',
      },
      start: {
        dateTime: new Date(task.due_date).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(new Date(task.due_date).getTime() + 3600000).toISOString(), // Default duration: 1 hour
        timeZone: 'UTC',
      },
      attendees: [
        {
          emailAddress: {
            address: task.case.client.email,
            name: `${task.case.client.first_name} ${task.case.client.last_name}`,
          },
          type: 'required',
        },
      ],
    };
  }

  private async updateMicrosoftToDoTask(
    toDoListId: string,
    todoTaskId: string,
    isComplete: boolean,
    req: Request,
  ) {
    const endpoint = `https://graph.microsoft.com/v1.0/me/todo/lists/${toDoListId}/tasks/${todoTaskId}`;
    const access_token = await this.graphService.getAccessToken(req);
    await this.graphService.patchMicrosoftResource(
      endpoint,
      { status: isComplete ? 'completed' : 'notStarted' },
      access_token,
    );
  }

  async deleteTask(taskId: string, req: Request) {
    try {
      // Step 1: Find the task to delete
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Step 2: Get access token for Microsoft Graph API
      const accessToken = await this.graphService.getAccessToken(req);

      // Step 3: Delete the task from Microsoft To-Do if it exists
      if (task.microsoft_todo_id && task.microsoft_list_id) {
        const todoEndpoint = `https://graph.microsoft.com/v1.0/me/todo/lists/${task.microsoft_list_id}/tasks/${task.microsoft_todo_id}`;
        try {
          await axios.delete(todoEndpoint, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } catch (err) {
          console.error(
            `Failed to delete Microsoft To-Do task with ID ${task.microsoft_todo_id}: ${err.message}`,
          );
        }
      }

      // Step 4: Delete the corresponding calendar event if it exists
      if (task.microsoft_calendar_event_id) {
        const calendarEndpoint = `https://graph.microsoft.com/v1.0/me/events/${task.microsoft_calendar_event_id}`;
        try {
          await axios.delete(calendarEndpoint, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } catch (err) {
          console.error(
            `Failed to delete Microsoft Calendar event with ID ${task.microsoft_calendar_event_id}: ${err.message}`,
          );
        }
      }

      // Step 5: Delete the task from the database
      await this.prisma.task.delete({
        where: { id: taskId },
      });

      return { message: 'Task and associated Microsoft resources deleted successfully' };
    } catch (err) {
      prismaError(err);
    }
  }
}
