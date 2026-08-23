## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `.env.example`, `drizzle.config.ts`

**Interfaces:**
- Produces: Project skeleton ready for development

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest safebuy --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Select: TypeScript, Tailwind CSS, ESLint, App Router, src directory, `@/*` import alias.

- [ ] **Step 2: Install core dependencies**

```bash
npm install drizzle-orm @neondatabase/serverless bcryptjs jsonwebtoken zod cloudinary nodemailer upstash/ratelimit @upstash/redis goey-toast framer-motion
npm install -D drizzle-kit @types/bcryptjs @types/jsonwebtoken @types/nodemailer
```

- [ ] **Step 3: Create `.env.example`**

```env
# Database
DATABASE_URL=

# JWT
JWT_SECRET=
REFRESH_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Nodemailer)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 4: Create `drizzle.config.ts`**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 5: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx seed.ts"
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialize project with Next.js 15, Drizzle, Tailwind"
```

---
