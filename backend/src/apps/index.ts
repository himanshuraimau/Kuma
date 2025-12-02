import { appRegistry } from './base.app';
import { GmailApp } from './gmail/gmail.app';
import { CalendarApp } from './calendar/calendar.app';
import { DocsApp } from './docs/docs.app';

// Register all apps
appRegistry.register(new GmailApp());
appRegistry.register(new CalendarApp());
appRegistry.register(new DocsApp());

console.log('📱 Apps registered:', appRegistry.getAll().map((app) => app.displayName).join(', '));

export { appRegistry };
export type { BaseApp } from './base.app';
