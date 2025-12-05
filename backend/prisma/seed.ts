import { prisma } from '../src/db/prisma';

async function seedApps() {
    console.log('🌱 Seeding apps...');

    // Create Gmail app
    await prisma.app.upsert({
        where: { name: 'gmail' },
        update: {},
        create: {
            name: 'gmail',
            category: 'communication',
            displayName: 'Gmail',
            description: 'Send and read emails, manage your inbox',
            icon: '📧',
            authType: 'oauth2',
            isActive: true,
            config: {},
        },
    });

    // Create Google Calendar app
    await prisma.app.upsert({
        where: { name: 'calendar' },
        update: {},
        create: {
            name: 'calendar',
            category: 'productivity',
            displayName: 'Google Calendar',
            description: 'Schedule meetings, manage events, and check your calendar',
            icon: '📅',
            authType: 'oauth2',
            isActive: true,
            config: {},
        },
    });

    // Create Google Docs app
    await prisma.app.upsert({
        where: { name: 'docs' },
        update: {},
        create: {
            name: 'docs',
            category: 'productivity',
            displayName: 'Google Docs',
            description: 'Create, read, and manage Google Docs documents',
            icon: '📄',
            authType: 'oauth2',
            isActive: true,
            config: {},
        },
    });

    // Create Google Drive app
    await prisma.app.upsert({
        where: { name: 'drive' },
        update: {},
        create: {
            name: 'drive',
            category: 'storage',
            displayName: 'Google Drive',
            description: 'Store, organize, and access your documents and files',
            icon: '💾',
            authType: 'oauth2',
            isActive: true,
            config: {},
        },
    });

    // Create Google Sheets app
    await prisma.app.upsert({
        where: { name: 'sheets' },
        update: {},
        create: {
            name: 'sheets',
            category: 'productivity',
            displayName: 'Google Sheets',
            description: 'Create, read, and manage Google Sheets spreadsheets',
            icon: '📊',
            authType: 'oauth2',
            isActive: true,
            config: {},
        },
    });

    // Create Google Slides app
    await prisma.app.upsert({
        where: { name: 'slides' },
        update: {},
        create: {
            name: 'slides',
            category: 'productivity',
            displayName: 'Google Slides',
            description: 'Create, read, and manage Google Slides presentations',
            icon: '📽️',
            authType: 'oauth2',
            isActive: true,
            config: {},
        },
    });

    // Create GitHub app
    await prisma.app.upsert({
        where: { name: 'github' },
        update: {},
        create: {
            name: 'github',
            category: 'development',
            displayName: 'GitHub',
            description: 'Manage repositories, issues, pull requests, and more',
            icon: '🐙',
            authType: 'oauth2',
            isActive: true,
            config: {},
        },
    });

    console.log('✅ Apps seeded successfully!');
}

seedApps()
    .catch((error) => {
        console.error('❌ Error seeding apps:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
