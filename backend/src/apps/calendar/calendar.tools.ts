import { z } from 'zod';
import { google } from 'googleapis';
import type { BaseTool } from '../../tools/base.tool';
import { decryptCredentials } from '../../lib/encryption';
import { prisma } from '../../db/prisma';

/**
 * Create a calendar event
 */
export const createEventTool: BaseTool = {
    name: 'create_calendar_event',
    description:
        'Create a new event in Google Calendar. Use this when user wants to schedule a meeting, set a reminder, or create an appointment.',
    category: 'calendar',
    requiresAuth: true,
    schema: z.object({
        summary: z.string().describe('Event title/summary'),
        description: z.string().optional().describe('Event description'),
        startTime: z
            .string()
            .describe('Start time in ISO format (e.g., "2024-12-03T10:00:00")'),
        endTime: z
            .string()
            .describe('End time in ISO format (e.g., "2024-12-03T11:00:00")'),
        attendees: z
            .array(z.string())
            .optional()
            .describe('List of attendee email addresses'),
        location: z.string().optional().describe('Event location'),
    }),

    async execute(input, context) {
        if (!context?.userId) {
            throw new Error('User not authenticated');
        }

        const userApp = await prisma.userApp.findFirst({
            where: {
                userId: context.userId,
                app: { name: 'calendar' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return 'Google Calendar is not connected. Please connect Google Calendar from the Apps page first.';
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: input.summary,
            description: input.description,
            location: input.location,
            start: {
                dateTime: input.startTime,
                timeZone: 'UTC',
            },
            end: {
                dateTime: input.endTime,
                timeZone: 'UTC',
            },
            attendees: input.attendees?.map((email) => ({ email })),
        };

        try {
            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });

            return `✅ Event "${input.summary}" created successfully! Event link: ${response.data.htmlLink}`;
        } catch (error: any) {
            throw new Error(`Failed to create event: ${error.message}`);
        }
    },
};

/**
 * List upcoming calendar events
 */
export const listEventsTool: BaseTool = {
    name: 'list_calendar_events',
    description:
        'List upcoming events from Google Calendar. Use this to check schedule, see what meetings are coming up, or find free time.',
    category: 'calendar',
    requiresAuth: true,
    schema: z.object({
        maxResults: z
            .number()
            .default(10)
            .describe('Maximum number of events to return'),
        timeMin: z
            .string()
            .optional()
            .describe('Start time to filter events (ISO format)'),
        timeMax: z
            .string()
            .optional()
            .describe('End time to filter events (ISO format)'),
    }),

    async execute(input, context) {
        if (!context?.userId) {
            throw new Error('User not authenticated');
        }

        const userApp = await prisma.userApp.findFirst({
            where: {
                userId: context.userId,
                app: { name: 'calendar' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return 'Google Calendar is not connected. Please connect Google Calendar from the Apps page first.';
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        try {
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: input.timeMin || new Date().toISOString(),
                timeMax: input.timeMax,
                maxResults: input.maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = response.data.items || [];

            if (events.length === 0) {
                return 'No upcoming events found.';
            }

            const summary =
                `Found ${events.length} upcoming event(s):\n\n` +
                events
                    .map((event, i) => {
                        const start = event.start?.dateTime || event.start?.date;
                        const end = event.end?.dateTime || event.end?.date;
                        return `${i + 1}. ${event.summary}\n   Time: ${start} to ${end}\n   Location: ${event.location || 'No location'}`;
                    })
                    .join('\n\n');

            return summary;
        } catch (error: any) {
            throw new Error(`Failed to list events: ${error.message}`);
        }
    },
};

/**
 * Update a calendar event
 */
export const updateEventTool: BaseTool = {
    name: 'update_calendar_event',
    description:
        'Update an existing calendar event. Use this to reschedule meetings or modify event details.',
    category: 'calendar',
    requiresAuth: true,
    schema: z.object({
        eventId: z.string().describe('Event ID to update'),
        summary: z.string().optional().describe('New event title'),
        description: z.string().optional().describe('New event description'),
        startTime: z.string().optional().describe('New start time (ISO format)'),
        endTime: z.string().optional().describe('New end time (ISO format)'),
        location: z.string().optional().describe('New location'),
    }),

    async execute(input, context) {
        if (!context?.userId) {
            throw new Error('User not authenticated');
        }

        const userApp = await prisma.userApp.findFirst({
            where: {
                userId: context.userId,
                app: { name: 'calendar' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return 'Google Calendar is not connected. Please connect Google Calendar from the Apps page first.';
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        try {
            // Get existing event
            const existingEvent = await calendar.events.get({
                calendarId: 'primary',
                eventId: input.eventId,
            });

            // Update fields
            const updatedEvent = {
                ...existingEvent.data,
                summary: input.summary || existingEvent.data.summary,
                description: input.description || existingEvent.data.description,
                location: input.location || existingEvent.data.location,
                start: input.startTime
                    ? { dateTime: input.startTime, timeZone: 'UTC' }
                    : existingEvent.data.start,
                end: input.endTime
                    ? { dateTime: input.endTime, timeZone: 'UTC' }
                    : existingEvent.data.end,
            };

            await calendar.events.update({
                calendarId: 'primary',
                eventId: input.eventId,
                requestBody: updatedEvent,
            });

            return `✅ Event updated successfully!`;
        } catch (error: any) {
            throw new Error(`Failed to update event: ${error.message}`);
        }
    },
};
