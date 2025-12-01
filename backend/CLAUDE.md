# CLAUDE.md - Backend

This file provides guidance to Claude Code when working with the NestJS backend.

## Overview

JJIban Backend is a NestJS application providing REST APIs and WebSocket services for an AI-assisted development kanban tool. Built with Prisma ORM, PostgreSQL, and Socket.io for real-time features.

## Development Commands

### Installation & Setup
```bash
npm install

# Create .env file with:
DATABASE_URL="postgresql://jjiban:jjiban_password@localhost:5432/jjiban_db"
PORT=3000
JWT_SECRET="your-secret-key"
```

### Database (Prisma)
```bash
npx prisma generate              # Generate Prisma client after schema changes
npx prisma migrate dev           # Create and apply new migration
npx prisma migrate dev --name <description>  # Named migration
npx prisma db seed              # Seed database with test data
npx prisma studio               # Open Prisma Studio GUI
npx prisma migrate reset        # Reset DB (CAUTION: deletes all data)
```

### Development
```bash
npm run start:dev               # Watch mode (recommended)
npm run start:debug             # Debug mode with --inspect
npm run start                   # Standard mode
```

### Build & Production
```bash
npm run build                   # Build to dist/
npm run start:prod              # Run production build
```

### Testing
```bash
npm run test                    # Run unit tests
npm run test:watch              # Watch mode
npm run test:cov                # With coverage report
npm run test:debug              # Debug mode
npm run test:e2e                # E2E tests
```

### Code Quality
```bash
npm run lint                    # ESLint with --fix
npm run format                  # Prettier formatting
```

### Docker Database
```bash
# From project root:
docker-compose up -d            # Start PostgreSQL
docker-compose down             # Stop database
docker-compose logs -f postgres # View logs
```

## Architecture

### Module Structure
NestJS follows feature-based module organization:

```
src/
├── auth/           # JWT authentication
│   ├── strategies/ # Passport JWT strategy
│   ├── guards/     # Auth guards
│   └── decorators/ # Custom decorators (@CurrentUser)
├── prisma/         # Database service (singleton)
├── project/        # Project CRUD
├── issue/          # Issue/Task management
├── terminal/       # Terminal execution via WebSocket
├── llm/            # LLM prompt execution
├── workflow/       # Multi-step workflow automation
└── gateways/       # WebSocket gateways
```

### Core Patterns

**PrismaModule (Global Singleton)**
- Provides `PrismaService` to all modules
- Handles database connection lifecycle
- Injectable via standard NestJS DI

**Controller → Service → Repository Pattern**
- Controllers handle HTTP requests, validate DTOs
- Services contain business logic
- Prisma acts as repository layer

**WebSocket Integration**
- Gateways in `src/gateways/` for real-time features
- Use `@WebSocketGateway()` decorator
- Emit events: `this.server.emit('eventName', data)`
- Namespace isolation for different features

**DTO Validation**
- All endpoints use `class-validator` DTOs
- Global ValidationPipe in `main.ts`
- Automatic whitelist and transformation

## Database Schema (Prisma)

### Core Entities
```
User ──< ProjectMember >── Project
                            │
                            ├──< Issue (self-referencing hierarchy)
                            └──< PromptTemplate

Issue ──< TerminalLog >── PromptTemplate
Issue ──< WorkflowJob ──< WorkflowStep >── TerminalLog
```

### Key Relationships

**Issue Hierarchy** (`parentId` self-reference):
- Epic → Feature → Story → Task
- Use recursive queries for full tree

**PromptTemplate Context Filtering**:
- `visibleColumns`: Array of issue statuses where template appears
- `visibleTypes`: Array of issue types (Epic, Feature, Task)
- Used for context menu filtering

**WorkflowJob Pipeline**:
- Tracks multi-step automation (design → review → implement)
- Each WorkflowStep links to TerminalLog for execution history
- Status: pending, running, success, failed, waiting_approval

### After Schema Changes
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration:
npx prisma migrate dev --name add_new_field

# 3. Regenerate client:
npx prisma generate

# TypeScript types are now updated automatically
```

## Adding New Features

### Create New Module
```bash
# Generate module boilerplate
nest g module <name>
nest g service <name>
nest g controller <name>

# Import in app.module.ts
```

### Standard Module Template
```typescript
// <name>.module.ts
@Module({
  imports: [PrismaModule],  // If using database
  controllers: [<Name>Controller],
  providers: [<Name>Service],
  exports: [<Name>Service],  // If used by other modules
})
export class <Name>Module {}

// <name>.service.ts
@Injectable()
export class <Name>Service {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.<model>.findMany();
  }
}

// <name>.controller.ts
@Controller('<name>')
@ApiTags('<name>')  // Swagger grouping
export class <Name>Controller {
  constructor(private readonly service: <Name>Service) {}

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  findAll() {
    return this.service.findAll();
  }
}
```

### Adding WebSocket Gateway
```typescript
@WebSocketGateway({ namespace: '/feature' })
export class FeatureGateway {
  @WebSocketServer()
  server: Server;

  emitUpdate(data: any) {
    this.server.emit('featureUpdate', data);
  }
}
```

## Key Implementation Notes

### Authentication
- JWT strategy in `auth/strategies/jwt.strategy.ts`
- Use `@UseGuards(JwtAuthGuard)` on protected routes
- Extract user with `@CurrentUser()` decorator

### Prompt Template System
Templates stored in DB with variable placeholders:
```typescript
// Template example:
"Implement {{task.title}} with priority {{task.priority}}"

// Variable replacement happens in LlmService
// Available variables: task.*, project.*, user.*
```

### Workflow Execution
- WorkflowJobs execute sequential steps
- Two modes: fully automated or human-in-the-loop
- Each step can wait for approval (`waiting_approval` status)
- Resume from failed step via `currentStepIndex`

### Terminal Integration
- Terminal commands executed via child_process
- Output streamed via WebSocket to frontend
- Logs stored in TerminalLog table for audit

## Testing Guidelines

### Unit Tests
```typescript
// <name>.service.spec.ts
describe('<Name>Service', () => {
  let service: <Name>Service;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        <Name>Service,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<<Name>Service>(<Name>Service);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### E2E Tests
```typescript
// test/<name>.e2e-spec.ts
describe('<Name> (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/<name> (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/<name>')
      .expect(200);
  });
});
```

## API Documentation

Swagger UI available at `http://localhost:3000/api`

Use decorators for documentation:
```typescript
@ApiOperation({ summary: 'Create new item' })
@ApiResponse({ status: 201, description: 'Created successfully' })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiBearerAuth()  // For protected routes
```

## Known Issues & Incomplete Features

- Document auto-generation for tasks not implemented
- Workflow automation UI integration incomplete
- File watching for LLM-generated outputs not configured
- Template variable autocomplete backend support needed

## Environment Variables

Required in `.env`:
```bash
DATABASE_URL="postgresql://jjiban:jjiban_password@localhost:5432/jjiban_db"
PORT=3000
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
```

## Useful Commands

```bash
# Check NestJS version
nest --version

# Update NestJS packages
nest update

# Generate resource (CRUD boilerplate)
nest g resource <name>

# View available generators
nest g --help
```
