import { appRegistry } from './base.app';
import { GmailApp } from './gmail/gmail.app';
import { CalendarApp } from './calendar/calendar.app';
import { DocsApp } from './docs/docs.app';
import { DriveApp } from './drive/drive.app';
import { SheetsApp } from './sheets/sheets.app';
import { SlidesApp } from './slides/slides.app';
import { GitHubApp } from './github/github.app';

// Register all apps
appRegistry.register(new GmailApp());
appRegistry.register(new CalendarApp());
appRegistry.register(new DocsApp());
appRegistry.register(new DriveApp());
appRegistry.register(new SheetsApp());
appRegistry.register(new SlidesApp());
appRegistry.register(new GitHubApp());

console.log('📱 Apps registered:', appRegistry.getAll().map((app) => app.displayName).join(', '));

export { appRegistry };
export type { BaseApp } from './base.app';
