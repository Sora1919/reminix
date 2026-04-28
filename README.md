# Reminix — Smart Event Reminder (Event Planner System)

Reminix is a full-stack web application that helps users plan events, organize schedules, and collaborate with others using event chat and notifications.  
Built as a final year project with a modern Next.js stack, responsive UI, and dark mode support.

---

## Key Features

### Event Management
- Create, edit, delete events
- Priority levels: **Low / Medium / High**
- Optional category & location
- Search & filters:
    - Filter by **Category**
    - Filter by **Priority**
    - Search by **Title / Description**

### Calendar
- Month view (and alternative views depending on your setup)
- Click events to view details
- Dark mode friendly calendar styling

### Collaboration & Chat
- Event chat room (messages, emoji, reactions)
- File upload support (uploads stored under `/uploads/...`)
- Better chat UX:
    - Scrollable message area
    - “Scroll to bottom” button when you scroll up

### Profile
- Update name
- Upload profile picture from your device (saved as `/uploads/...`)
- Dark mode toggle

### UI / UX
- Responsive layout (desktop + mobile)
- Sidebar + mobile sidebar
- Clean cards, consistent spacing, dark mode friendly tokens

---

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI:** Tailwind CSS + shadcn/ui components
- **Auth:** NextAuth (Credentials)
- **Database:** MySQL
- **ORM:** Prisma
- **Calendar:** FullCalendar
- **Toasts:** sonner

---

## Getting Started (Local Setup)
### 1.Prerequisites
- Node.js (LTS recommended)
- MySQL running locally
- Git (optional but recommended)

### 2.Install dependencies
```
npm install
```

### 3.Create .env
```
# Database (MySQL)
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/reminix"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_RANDOM_SECRET"
```

### 4) Setup database (Prisma)
```
npx prisma generate
npx prisma migrate dev
```

### 5) Run the app
```
npm run dev
```

### Open
```
http://localhost:3000
```

## Common Troubleshooting

### MySQL connection error
**If you see**:
- “Please make sure your database server is running at localhost:3306”

✅ Fix:

- Start MySQL server
- Confirm DATABASE_URL is correct

### Profile save returns 405 / cannot load profile

✅ Fix:

- Ensure src/app/api/profile/route.ts has GET and PUT handlers.

### Profile image upload says “Image must be a valid URL”

✅ Fix:

- Your profile API must accept /uploads/... paths (not only http/https).

### Event chat shows error only on first open

✅ Fix:

- Messages GET should return an empty array if chat room doesn’t exist yet (instead of 404).

## Project Structure (High Level)

```
src/
  app/
    (protected)/
      dashboard/
      events/
      calendar/
      profile/
    api/
      events/
      profile/
      upload/
  components/
    dashboard/
    events/
    calendar/
    chat/
    ui/
  lib/
  types/
prisma/
public/
  uploads/
```

## Notes

- Uploaded files are saved under public/uploads/
- Image paths are stored as /uploads/... in the database
- Dark mode uses Tailwind + shadcn tokens for consistent styling

## Author
### Kaung Set Linn