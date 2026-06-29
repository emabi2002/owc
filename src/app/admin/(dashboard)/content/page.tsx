import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ContentManager } from "@/components/admin/content-manager";
import { getContentItems } from "@/lib/data/cms";
import { getSessionUser, requirePermission } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";

export default async function ContentPage() {
  await requirePermission("content.edit");
  const [items, user] = await Promise.all([getContentItems(), getSessionUser()]);
  const role = user?.role;

  const perms = {
    canCreate: hasPermission(role, "content.create"),
    canEdit: hasPermission(role, "content.edit"),
    canSubmit: hasPermission(role, "content.submit"),
    canApprove: hasPermission(role, "content.approve"),
    canPublish: hasPermission(role, "content.publish"),
    canDelete: hasPermission(role, "content.delete"),
  };

  return (
    <>
      <AdminPageHeader
        title="Content management"
        description="Create, edit and publish news, pages, reports, forms and public notices through the editorial workflow."
      />
      <ContentManager items={items} perms={perms} />
    </>
  );
}
