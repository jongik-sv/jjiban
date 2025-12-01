import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create default projects with fixed IDs
    const project1 = await prisma.project.upsert({
        where: { id: 'ac2ea160-fd5f-4ac1-a67e-b7e70372e2bf' },
        update: {},
        create: {
            id: 'ac2ea160-fd5f-4ac1-a67e-b7e70372e2bf',
            name: 'JJIban Main Project',
            key: 'MAIN',
            rootPath: '/projects/jjiban-main',
            description: 'Main development project for JJIban',
        },
    });

    const project2 = await prisma.project.upsert({
        where: { id: '26da4aa0-e6c3-4ddc-911e-d6f277e6a689' },
        update: {},
        create: {
            id: '26da4aa0-e6c3-4ddc-911e-d6f277e6a689',
            name: 'JJIban Project',
            key: 'JJI',
            rootPath: '/projects/jjiban',
            description: 'The first project managed by JJIban',
        },
    });

    console.log({ project1, project2 });

    // Use project1 as the main project for issues
    const project = project1;

    // Create some issues
    const issue1 = await prisma.issue.create({
        data: {
            projectId: project.id,
            type: 'Task',
            title: 'Implement Kanban Board',
            description: 'Drag and drop functionality',
            status: 'In Progress',
            priority: 'high',
        },
    });

    const issue2 = await prisma.issue.create({
        data: {
            projectId: project.id,
            type: 'Feature',
            title: 'WebSocket Integration',
            description: 'Real-time updates',
            status: 'To Do',
            priority: 'medium',
        },
    });

    console.log({ issue1, issue2 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
