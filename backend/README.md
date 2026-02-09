# WAPulse Backend API

Backend API for WAPulse - WhatsApp Business Management Platform

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your values.

### 3. Setup Database

Make sure PostgreSQL is running, then:

```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

---

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema to PostgreSQL
- `npm run db:studio` - Open Prisma Studio (database GUI)

---

## 🔧 Environment Variables

### Required Variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wapulse"

# JWT Secrets (MUST CHANGE IN PRODUCTION!)
JWT_ACCESS_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-secret-key-min-32-chars"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

### Optional Variables:

```env
# Server
PORT=3001
NODE_ENV=development

# Redis (for caching)
REDIS_URL="redis://localhost:6379"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### User

- `GET /api/user/profile` - Get user profile (requires auth)
- `PUT /api/user/profile` - Update user profile (requires auth)

### Sessions (Coming Soon)

- `GET /api/sessions` - Get all WhatsApp sessions
- `POST /api/sessions` - Create new session

### Messages (Coming Soon)

- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message

### Contacts (Coming Soon)

- `GET /api/contacts` - Get contacts
- `POST /api/contacts` - Add contact

### Campaigns (Coming Soon)

- `GET /api/campaigns` - Get campaigns
- `POST /api/campaigns` - Create campaign

---

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Token Lifecycle:

- **Access Token**: Expires in 15 minutes
- **Refresh Token**: Expires in 7 days

Use `/api/auth/refresh` to get a new access token.

---

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM.

### Main Tables:

- **users** - User accounts
- **sessions** - WhatsApp sessions
- **messages** - Chat messages
- **contacts** - Contact list
- **campaigns** - Marketing campaigns

---

## 🚢 Deployment

### Deploy to EasyPanel:

1. Push code to GitHub
2. Create new project in EasyPanel
3. Connect GitHub repository
4. Set environment variables
5. Deploy!

### Build Settings:

```
Install Command: npm install
Build Command: npm run build
Start Command: npm start
```

---

## 📝 Development Notes

### Database Changes:

After modifying `prisma/schema.prisma`, run:

```bash
npm run db:push
```

### View Database:

```bash
npm run db:studio
```

This opens Prisma Studio at `http://localhost:5555`

---

## 🐛 Troubleshooting

### Database Connection Error:

Make sure PostgreSQL is running and DATABASE_URL is correct.

### Port Already in Use:

Change PORT in `.env` file.

### JWT Errors:

Make sure JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set.

---

## 📚 Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet + CORS + Rate Limiting

---

## 📄 License

MIT
