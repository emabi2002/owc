"use server";

import { revalidatePath } from "next/cache";
import {
  createNews,
  deleteContent,
  transitionContent,
  type NewNewsInput,
  type TransitionAction,
  type WorkflowTable,
} from "@/lib/data/cms";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission, type Permission } from "@/lib/auth/roles";

export type ActionResult = { ok: boolean; message: string };

export async function createNewsAction(
  input: NewNewsInput,
): Promise<ActionResult & { id?: string }> {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, "content.create")) {
    return { ok: false, message: "You do not have permission to create content." };
  }
  if (!input.title || input.title.trim().length < 3) {
    return { ok: false, message: "Please enter a title (at least 3 characters)." };
  }
  const res = await createNews(
    {
      title: input.title.trim(),
      category: input.category,
      excerpt: input.excerpt,
      body: input.body,
      imageUrl: input.imageUrl,
    },
    { id: user.demo ? undefined : user.id, email: user.email },
  );
  revalidatePath("/admin/content");
  revalidatePath("/admin");
  revalidatePath("/news");
  return res;
}

function permissionFor(action: TransitionAction): Permission {
  switch (action) {
    case "approve":
    case "publish":
      return "content.publish";
    case "submit":
      return "content.submit";
    default:
      return "content.edit";
  }
}

export async function contentTransitionAction(
  table: WorkflowTable,
  id: string,
  action: TransitionAction,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, permissionFor(action))) {
    return { ok: false, message: "You do not have permission for this action." };
  }
  const res = await transitionContent(table, id, action, {
    id: user.demo ? undefined : user.id,
    email: user.email,
  });
  revalidatePath("/admin/content");
  revalidatePath("/admin");
  return { ok: res.ok, message: res.message };
}

export async function contentDeleteAction(
  table: WorkflowTable,
  id: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, "content.delete")) {
    return { ok: false, message: "You do not have permission to delete content." };
  }
  const res = await deleteContent(table, id, {
    id: user.demo ? undefined : user.id,
    email: user.email,
  });
  revalidatePath("/admin/content");
  return { ok: res.ok, message: res.message };
}
