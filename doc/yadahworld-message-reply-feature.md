# Cursor Prompt — Contact Message Reply Thread Feature

Implement a reply thread feature for contact messages. Make the following changes exactly.

---

## 1. Update `prisma/schema.prisma`

Add a new `MessageReply` model:

```prisma
model MessageReply {
  id        String         @id @default(cuid())
  createdAt DateTime       @default(now())
  body      String
  message   ContactMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)
  messageId String
}
```

Also add the relation field to the existing `ContactMessage` model:

```prisma
replies   MessageReply[]
```

---

## 2. Create `src/app/api/admin/messages/[id]/reply/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ body: z.string().min(1) })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const reply = await prisma.messageReply.create({
    data: { body: parsed.data.body, messageId: params.id }
  })

  return NextResponse.json(reply)
}
```

---

## 3. Update `src/app/admin/(shell)/messages/page.tsx`

When fetching messages, include replies ordered by date:

```ts
const messages = await prisma.contactMessage.findMany({
  orderBy: { createdAt: 'desc' },
  include: { replies: { orderBy: { createdAt: 'asc' } } }
})
```

---

## 4. Update `src/components/admin/messages/MessagesInbox.tsx`

Add a reply thread UI below each message:
- Show existing replies in a thread list with timestamp and body
- Add a textarea and a **Send Reply** button below each message
- On send, POST to `/api/admin/messages/${m.id}/reply` with `{ body }`
- Clear the textarea and refresh the reply list after a successful send
- Show a loading state while sending

---

## 5. Run Prisma migration locally

After making these changes, run:

```bash
npx prisma migrate dev --name add_message_replies
```

---

## Important — Server migration

After pushing to GitHub and the auto-deploy completes, the following command must be run on the server to apply the migration to the production database:

```bash
cd /home/yadahworld && npx prisma migrate deploy
```

---

## Rules

- Do not modify any public-facing frontend pages
- Do not change any other files beyond those listed above
- Admin UI only
