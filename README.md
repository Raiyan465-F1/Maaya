# MAAYA

## When you clone the repo

1. **Install dependencies**
   ```bash
   pnpm i
   ```

2. **Create `.env`** in the project root with:
   - `DATABASE_URL` — PostgreSQL connection string (e.g. Neon)
   - `NEXTAUTH_SECRET` — random string (e.g. run `openssl rand -base64 32` and paste the output)
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev

3. **Create the database tables**
   ```bash
   pnpm db:migrate
   ```

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
