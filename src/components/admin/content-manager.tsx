"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FileEdit,
  Eye,
  Send,
  CheckCircle2,
  Globe,
  Undo2,
  Archive,
  Trash2,
  PenLine,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/admin-shell";
import type {
  ContentItem,
  ContentType,
  WorkflowStatus,
} from "@/lib/data/types";
import type { TransitionAction, WorkflowTable } from "@/lib/data/cms";
import {
  contentDeleteAction,
  contentTransitionAction,
  createNewsAction,
} from "@/lib/actions/content";
import { cn } from "@/lib/utils";

const NEWS_CATEGORIES = [
  "Announcement",
  "Awareness",
  "Public Notice",
  "Consultation",
  "Labour Update",
];

const TYPES: (ContentType | "All")[] = [
  "All",
  "News",
  "Notice",
  "Page",
  "Report",
  "Form",
  "Publication",
  "Legislation",
  "Tender",
];

const WORKFLOW = [
  { icon: PenLine, t: "Draft", d: "Author creates and edits content." },
  { icon: Send, t: "Submitted", d: "Sent to a reviewer for checking." },
  { icon: CheckCircle2, t: "Approved", d: "Reviewer approves the content." },
  { icon: Globe, t: "Published", d: "Content goes live on the website." },
];

const TABLE_BY_TYPE: Record<ContentType, WorkflowTable | null> = {
  News: "news",
  Notice: "news",
  Page: "pages",
  Report: "reports",
  Form: "forms",
  Publication: "publications",
  Legislation: "legislation",
  Tender: null,
};

export type ContentPerms = {
  canCreate: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

export function ContentManager({
  items,
  perms,
}: {
  items: ContentItem[];
  perms: ContentPerms;
}) {
  const router = useRouter();
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter(
        (c) =>
          (type === "All" || c.type === type) &&
          (q.trim() === "" || c.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [type, q, items],
  );

  const pendingReview = items.filter((c) => c.status === "Submitted");

  const run = (item: ContentItem, action: TransitionAction) => {
    const table = TABLE_BY_TYPE[item.type];
    if (!table) {
      toast.info(`Workflow for ${item.type} is managed in its own section.`);
      return;
    }
    setActiveId(item.id);
    startTransition(async () => {
      const res = await contentTransitionAction(table, item.id, action);
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
      setActiveId(null);
    });
  };

  const remove = (item: ContentItem) => {
    const table = TABLE_BY_TYPE[item.type];
    if (!table) return;
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setActiveId(item.id);
    startTransition(async () => {
      const res = await contentDeleteAction(table, item.id);
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
      setActiveId(null);
    });
  };

  const busy = (id: string) => pending && activeId === id;

  return (
    <>
      {/* Workflow */}
      <div id="approvals" className="mb-6 scroll-mt-20 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-primary">
          Content approval workflow
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All content moves through a structured review process before it is
          published to the public website.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW.map((w, i) => (
            <div key={w.t} className="relative rounded-lg border border-border bg-secondary/40 p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
                  <w.icon className="h-4 w-4" />
                </span>
                <span className="font-semibold text-foreground">{i + 1}. {w.t}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{w.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending approvals */}
      {pendingReview.length > 0 && (
        <div className="mb-6 rounded-xl border border-warning/40 bg-warning/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
              Awaiting review
              <span className="rounded-full bg-warning px-2 text-xs font-bold text-warning-foreground">
                {pendingReview.length}
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {pendingReview.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-foreground">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.type} · by {c.author} · {c.updated}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.info("Opening preview…")}>
                  <Eye className="h-4 w-4" /> Preview
                </Button>
                {perms.canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    disabled={busy(c.id)}
                    onClick={() => run(c, "return")}
                  >
                    <Undo2 className="h-4 w-4" /> Return
                  </Button>
                )}
                {perms.canApprove && (
                  <Button size="sm" disabled={busy(c.id)} onClick={() => run(c, "approve")}>
                    {busy(c.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Approve
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Library header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-primary">Content library</h2>
        {perms.canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New content
          </Button>
        )}
      </div>

      {/* Library */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  type === t
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search content…" className="h-9 pl-9" aria-label="Search content" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Type</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Author</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                        <FileEdit className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-foreground">{c.title}</span>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{c.type}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{c.author}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <WorkflowActions item={c} perms={perms} run={run} remove={remove} busy={busy(c.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {items.length} items</span>
          {perms.canCreate && (
            <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New content
            </Button>
          )}
        </div>
      </div>

      <NewContentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => router.refresh()}
      />
    </>
  );
}

function NewContentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(NEWS_CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const reset = () => {
    setTitle("");
    setCategory(NEWS_CATEGORIES[0]);
    setExcerpt("");
    setBody("");
    setImageUrl("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      toast.error("Please enter a title (at least 3 characters).");
      return;
    }
    startTransition(async () => {
      const res = await createNewsAction({
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim(),
      });
      if (res.ok) {
        toast.success(`${res.message} — saved as Draft.`);
        reset();
        onOpenChange(false);
        onCreated();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-primary">New news article</DialogTitle>
          <DialogDescription>
            Creates a <strong>Draft</strong>. Move it through Submit → Approve →
            Publish to make it live on the public website.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="nc-title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="nc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article headline"
              className="mt-1.5"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="nc-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="nc-category" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEWS_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nc-excerpt">Excerpt</Label>
            <Textarea
              id="nc-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Short summary shown on news cards"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="nc-body">Body</Label>
            <Textarea
              id="nc-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Full article text"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="nc-image">Image URL (optional)</Label>
            <Input
              id="nc-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
              ) : (
                <><Plus className="h-4 w-4" /> Create draft</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WorkflowActions({
  item,
  perms,
  run,
  remove,
  busy,
}: {
  item: ContentItem;
  perms: ContentPerms;
  run: (item: ContentItem, action: TransitionAction) => void;
  remove: (item: ContentItem) => void;
  busy: boolean;
}) {
  const status: WorkflowStatus = item.status;
  return (
    <>
      {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      {status === "Draft" && perms.canSubmit && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => run(item, "submit")}>
          <Send className="h-3.5 w-3.5" /> Submit
        </Button>
      )}
      {status === "Submitted" && perms.canApprove && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => run(item, "approve")}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
        </Button>
      )}
      {status === "Approved" && perms.canPublish && (
        <Button size="sm" disabled={busy} onClick={() => run(item, "publish")}>
          <Globe className="h-3.5 w-3.5" /> Publish
        </Button>
      )}
      {status === "Published" && perms.canPublish && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => run(item, "archive")}>
          <Archive className="h-3.5 w-3.5" /> Archive
        </Button>
      )}
      {(status === "Submitted" || status === "Approved" || status === "Archived") &&
        perms.canEdit && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(item, "return")} aria-label="Return to draft">
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
        )}
      {perms.canDelete && (
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          disabled={busy}
          onClick={() => remove(item)}
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </>
  );
}
