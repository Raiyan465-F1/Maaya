import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNotificationStreamSnapshot } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function encodeSse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      let lastPayload = "";

      const pushSnapshot = async () => {
        if (closed) return;
        const snapshot = await getNotificationStreamSnapshot(userId, 25);
        const serialized = JSON.stringify(snapshot);
        if (serialized !== lastPayload) {
          lastPayload = serialized;
          controller.enqueue(encoder.encode(encodeSse("notifications", snapshot)));
        } else {
          controller.enqueue(
            encoder.encode(encodeSse("heartbeat", { at: new Date().toISOString() })),
          );
        }
      };

      await pushSnapshot();
      const interval = setInterval(() => {
        void pushSnapshot();
      }, 5000);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        controller.close();
      };

      controller.enqueue(
        encoder.encode(encodeSse("connected", { connected: true })),
      );

      // Best-effort timeout cleanup for long-lived route handlers.
      setTimeout(close, 5 * 60 * 1000);
    },
    cancel() {
      // no-op; interval cleanup handled by timeout
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
