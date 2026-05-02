import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NotificationsCenter } from "@/components/notifications-center";
import { authOptions } from "@/lib/auth";
import { listUserNotifications } from "@/lib/notifications";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/notifications");
  }

  const data = await listUserNotifications({
    userId: session.user.id,
    limit: 100,
    markSeen: true,
  });
  const archived = await listUserNotifications({
    userId: session.user.id,
    limit: 100,
    filter: "archived",
  });

  const combinedNotifications = [...data.notifications];
  for (const item of archived.notifications) {
    if (!combinedNotifications.some((existing) => existing.id === item.id)) {
      combinedNotifications.push(item);
    }
  }
  combinedNotifications.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return (
    <NotificationsCenter
      initialNotifications={combinedNotifications}
      initialUnreadCount={data.unreadCount}
      initialUnseenCount={data.unseenCount}
    />
  );
}
