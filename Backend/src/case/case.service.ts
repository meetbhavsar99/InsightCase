import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Access_level, Status } from '@prisma/client';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { prismaError } from 'src/shared/filters/error-handling';
import { GraphService } from 'src/graph/graph.service';
import { Request } from 'express';
import axios from 'axios';

@Injectable()
export class CaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphService: GraphService,
  ) {}

  // Find a case by ID
  async findCaseById(id: string) {
    return this.prisma.case.findUnique({
      where: { id },
      include: { client: true, tasks: true },
    });
  }

  // Assign a user access to a case
  async assignCaseAccess(user_id: string, case_id: string, access_level: Access_level) {
    return this.prisma.case_access.create({
      data: {
        user_id,
        case_id,
        access_level,
      },
    });
  }

  async getAllCases(status?: Status) {
    try {
      const whereCondition = status ? { status } : undefined;

      return await this.prisma.case.findMany({
        where: whereCondition,
        include: {
          case_manager: true,
          staff: true,
          client: true,
          service: true,
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });
    } catch (err) {
      prismaError(err);
    }
  }

  async getCasesForUser(user_id: string) {
    return this.prisma.case_access.findMany({
      where: { user_id },
      include: { case: true },
    });
  }

  async createCase(dto: CreateCaseDto, req: Request) {
    try {
      const { client_id, case_manager_id, service_id, start_at, region, status, staff_id } = dto;
      const start_date = new Date(start_at);

      const service = await this.prisma.service.findUnique({
        where: { id: service_id },
      });

      const client = await this.prisma.client.findFirst({ where: { id: client_id } });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      if (!service) {
        throw new NotFoundException('Service does not exist!');
      }

      const newCase = await this.prisma.case.create({
        data: {
          client_id,
          case_manager_id,
          staff_id,
          service_id,
          start_at: start_date.toISOString(),
          region,
          status: status || Status.OPEN,
        },
      });

      const tasks = [];

      if (service.initial_contact_days) {
        tasks.push({
          case_id: newCase.id,
          description: 'Initial contact',
          due_date: new Date(
            start_date.getTime() + service.initial_contact_days * 24 * 60 * 60 * 1000,
          ),
          staff_id,
        });
      }

      if (service.intake_interview_days) {
        tasks.push({
          case_id: newCase.id,
          description: 'Intake Interview',
          due_date: new Date(
            start_date.getTime() + service.intake_interview_days * 24 * 60 * 60 * 1000,
          ),
          staff_id,
        });
      }

      if (service.action_plan_weeks) {
        tasks.push({
          case_id: newCase.id,
          description: 'Employment Action Plan (EAP)',
          due_date: new Date(
            start_date.getTime() + service.action_plan_weeks * 7 * 24 * 60 * 60 * 1000,
          ),
          staff_id,
        });
      }

      // Insert tasks into the database
      await this.prisma.task.createMany({ data: tasks, skipDuplicates: true });

      // Retrieve tasks from the database to get their IDs
      const createdTasks = await this.prisma.task.findMany({
        where: { case_id: newCase.id },
        include: {
          case: {
            include: {
              client: true,
            },
          },
        },
      });

      const access_token = await this.graphService.getAccessToken(req);

      // Create a To-Do list for the staff
      const toDoListId = await this.graphService.createToDoList(
        access_token,
        `Tasks for Client - ${client.first_name} ${client.last_name}`,
      );

      // Integrate tasks with Microsoft To-Do and Calendar
      for (const task of createdTasks) {
        const todoTaskId = await this.graphService.addTaskToToDoList(
          access_token,
          toDoListId,
          task.description,
          task.due_date.toISOString(),
        );

        const calendarEventId = await this.graphService.addEventToCalendar(access_token, {
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
            dateTime: task.due_date.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: new Date(task.due_date.getTime() + 3600000).toISOString(), // 1-hour event
            timeZone: 'UTC',
          },
          attendees: [
            {
              emailAddress: {
                address: client.email,
                name: `${client.first_name} ${client.last_name}`,
              },
              type: 'required',
            },
          ],
        });

        // Update task with Microsoft IDs
        await this.prisma.task.update({
          where: { id: task.id },
          data: {
            microsoft_list_id: toDoListId,
            microsoft_todo_id: todoTaskId,
            microsoft_calendar_event_id: calendarEventId,
          },
        });
      }

      return newCase;
    } catch (err) {
      prismaError(err);
    }
  }

  async updateCase(caseId: string, dto: UpdateCaseDto, req: Request) {
    try {
      // Retrieve the case
      const existingCase = await this.prisma.case.findUnique({
        where: { id: caseId },
        include: { tasks: true },
      });

      if (!existingCase) {
        throw new NotFoundException('Case not found');
      }

      // Validate and update case status
      const validStatuses = ['OPEN', 'ONGOING', 'CLOSED'];
      if (dto.status && !validStatuses.includes(dto.status)) {
        throw new BadRequestException('Invalid case status');
      }

      // Update case status
      const updatedCase = await this.prisma.case.update({
        where: { id: caseId },
        data: {
          status: dto.status || existingCase.status,
          closed_at: dto.status === 'CLOSED' ? new Date() : null,
        },
      });

      // Handle task updates if provided
      if (dto.tasks && dto.tasks.length > 0) {
        for (const taskUpdate of dto.tasks) {
          const task = existingCase.tasks.find((t) => t.id === taskUpdate.id);

          if (!task) {
            throw new NotFoundException(`Task with ID ${taskUpdate.id} not found`);
          }

          // Update task completion status in the database
          await this.prisma.task.update({
            where: { id: task.id },
            data: { is_complete: taskUpdate.is_complete },
          });

          // Sync with Microsoft To-Do
          if (task.microsoft_todo_id) {
            const endpoint = `https://graph.microsoft.com/v1.0/me/todo/lists/${task.microsoft_list_id}/tasks/${task.microsoft_todo_id}`;
            const accessToken = await this.graphService.getAccessToken(req);

            await this.graphService.patchMicrosoftResource(
              endpoint,
              { status: taskUpdate.is_complete ? 'completed' : 'notStarted' },
              accessToken,
            );
          }

          // Sync with Microsoft Calendar
          if (task.microsoft_calendar_event_id) {
            const endpoint = `https://graph.microsoft.com/v1.0/me/calendar/events/${task.microsoft_calendar_event_id}`;
            const accessToken = await this.graphService.getAccessToken(req);

            await this.graphService.patchMicrosoftResource(
              endpoint,
              { isCancelled: taskUpdate.is_complete },
              accessToken,
            );
          }
        }
      }

      return updatedCase;
    } catch (err) {
      prismaError(err);
    }
  }

  async fetchAndFormatCalendarEvents(req: Request): Promise<any[]> {
    const access_token = await this.graphService.getAccessToken(req);
    const endpoint = 'https://graph.microsoft.com/v1.0/me/events';

    try {
      // Fetch events from the Microsoft Graph API
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const events = response.data.value;

      // Format events for the frontend
      return events.map((event) => ({
        id: event.id,
        title: event.subject,
        startDate: event.start?.dateTime || null,
        endDate: event.end?.dateTime || null,
        location: event.location?.displayName || 'No location',
        organizer: event.organizer?.emailAddress?.name || 'Unknown organizer',
      }));
    } catch (err) {
      throw new Error(`Failed to fetch calendar events: ${err.message}`);
    }
  }

  async deleteCase(caseId: string, req: Request) {
    try {
      // Step 1: Retrieve the case and its tasks
      const caseData = await this.prisma.case.findUnique({
        where: { id: caseId },
        include: { tasks: true },
      });

      if (!caseData) {
        throw new NotFoundException('Case not found');
      }

      const access_token = await this.graphService.getAccessToken(req);

      // Step 2: Delete the To-Do list (if it exists)
      const todoListId = caseData.tasks[0]?.microsoft_list_id; // Assuming all tasks belong to the same list
      if (todoListId) {
        const todoEndpoint = `https://graph.microsoft.com/v1.0/me/todo/lists/${todoListId}`;
        try {
          await axios.delete(todoEndpoint, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
        } catch (err) {
          console.error(
            `Failed to delete Microsoft To-Do list with ID ${todoListId}: ${err.message}`,
          );
        }
      }

      // Step 3: Delete associated events from Microsoft Calendar
      for (const task of caseData.tasks) {
        if (task.microsoft_calendar_event_id) {
          const calendarEndpoint = `https://graph.microsoft.com/v1.0/me/calendar/events/${task.microsoft_calendar_event_id}`;
          try {
            await axios.delete(calendarEndpoint, {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            });
          } catch (err) {
            console.error(
              `Failed to delete Microsoft Calendar event with ID ${task.microsoft_calendar_event_id}: ${err.message}`,
            );
          }
        }
      }

      // Step 4: Delete tasks from the database
      await this.prisma.task.deleteMany({
        where: { case_id: caseId },
      });

      // Step 5: Delete the case from the database
      await this.prisma.case.delete({
        where: { id: caseId },
      });

      return { message: 'Case and associated tasks deleted successfully' };
    } catch (err) {
      prismaError(err);
    }
  }
}
