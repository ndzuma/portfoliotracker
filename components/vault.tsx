"use client";

import { useState, useRef, FormEvent, ChangeEvent, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  Crosshair,
  FileText,
  BookOpen,
  Plus,
  ArrowSquareOut,
  Trash,
  PencilSimple,
  FloppyDisk,
  X,
  Upload,
  CircleNotch,
  DotsThree,
  LinkSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress/index";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ---------- TYPES ---------- */
interface V2VaultProps {
  portfolioId: string;
  portfolioValue: number;
  annualReturn: number;
  userId?: string;
}

/* ========================================================================== */
/*  GOAL TRACKER                                                               */
/* ========================================================================== */
function GoalTracker({
  portfolioId,
  portfolioValue,
  annualReturn,
}: {
  portfolioId: string;
  portfolioValue: number;
  annualReturn: number;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const goals = useQuery(api.goals.getGoalsByPortfolio, {
    portfolioId: portfolioId as Id<"portfolios">,
  });
  const upsertGoals = useMutation(api.goals.upsertGoals);

  const defaults = {
    targetValue: 100000,
    targetReturn: 8,
    targetContribution: 500,
  };
  const g = goals || defaults;

  const [form, setForm] = useState(g);
  useEffect(() => {
    if (goals) setForm(goals);
  }, [goals]);

  const pctValue = Math.min(
    Math.round((portfolioValue / g.targetValue) * 100),
    100,
  );
  const pctReturn = Math.min(
    Math.round((annualReturn / g.targetReturn) * 100),
    100,
  );

  const handleSave = async () => {
    try {
      await upsertGoals({
        portfolioId: portfolioId as Id<"portfolios">,
        targetValue: form.targetValue,
        targetReturn: form.targetReturn,
        targetContribution: form.targetContribution,
      });
      setEditOpen(false);
      toast.success("Goals updated");
    } catch {
      toast.error("Failed to save goals");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Value progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-300">Portfolio Value</span>
            <span className="text-xs text-zinc-500">
              ${portfolioValue.toLocaleString()} / $
              {g.targetValue.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pctValue}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-600 mt-1">{pctValue}% of goal</p>
        </div>

        {/* Return progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-300">Annual Return</span>
            <span className="text-xs text-zinc-500">
              {annualReturn.toFixed(1)}% / {g.targetReturn}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${pctReturn}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-600 mt-1">
            {pctReturn}% of target
          </p>
        </div>

        <button
          onClick={() => setEditOpen(true)}
          className="self-start text-xs text-zinc-500 hover:text-white transition-colors mt-1"
        >
          Edit goals
        </button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <DialogTitle className="text-white text-base font-semibold">
              Edit Goals
            </DialogTitle>
          </div>
          <div className="px-6 pb-6 pt-5">
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">
                  Target Value ($)
                </Label>
                <Input
                  type="number"
                  value={form.targetValue}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetValue: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-900 border-white/[0.06] text-white h-9"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">
                  Target Return (%)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.targetReturn}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetReturn: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-900 border-white/[0.06] text-white h-9"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">
                  Monthly Contribution ($)
                </Label>
                <Input
                  type="number"
                  value={form.targetContribution}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetContribution: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-900 border-white/[0.06] text-white h-9"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 mt-3 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                Save Goals
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ========================================================================== */
/*  ARTICLES                                                                   */
/* ========================================================================== */
function ArticlesList({
  userId,
  portfolioId,
  searchQuery,
}: {
  userId: string;
  portfolioId: string;
  searchQuery: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const articles =
    useQuery(api.articles.getArticles, { userId, portfolioId }) || [];
  const addArticle = useMutation(api.articles.saveArticle);
  const deleteArticle = useMutation(api.articles.deleteArticle);

  // Filter articles by search query
  const filteredArticles = searchQuery
    ? articles.filter(
        (a: { title: string; url: string; notes?: string; _id: string }) => {
          const q = searchQuery.toLowerCase();
          return (
            a.title.toLowerCase().includes(q) ||
            a.url.toLowerCase().includes(q) ||
            (a.notes && a.notes.toLowerCase().includes(q))
          );
        },
      )
    : articles;

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) return;
    try {
      await addArticle({
        userId: userId as Id<"users">,
        portfolioId: portfolioId as Id<"portfolios">,
        title,
        url,
      });
      setTitle("");
      setUrl("");
      setAddOpen(false);
      toast.success("Article saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArticle({
        articleId: id as Id<"userArticles">,
        userId: userId as Id<"users">,
      });
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {filteredArticles.length === 0 ? (
          <p className="text-sm text-zinc-600 py-3">
            {searchQuery ? "No matching articles." : "No saved articles yet."}
          </p>
        ) : (
          filteredArticles.map(
            (a: {
              _id: string;
              title: string;
              url: string;
              notes?: string;
            }) => (
              <div
                key={a._id}
                className="group flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <LinkSimple className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 truncate">{a.title}</p>
                  <p className="text-[11px] text-zinc-600 truncate">
                    {(() => {
                      try {
                        return new URL(a.url).hostname;
                      } catch {
                        return a.url;
                      }
                    })()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <ArrowSquareOut className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ),
          )
        )}
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mt-1 self-start"
        >
          <Plus className="h-3 w-3" /> Add article
        </button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <DialogTitle className="text-white text-base font-semibold">
              Save Article
            </DialogTitle>
          </div>
          <div className="px-6 pb-6 pt-5">
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title"
                  className="bg-zinc-900 border-white/[0.06] text-white h-9"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">URL</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-zinc-900 border-white/[0.06] text-white h-9"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 mt-3 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!title.trim() || !url.trim()}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Article
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ========================================================================== */
/*  DOCUMENTS                                                                  */
/* ========================================================================== */
function DocumentsList({
  userId,
  portfolioId,
  searchQuery,
}: {
  userId: string;
  portfolioId: string;
  searchQuery: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const docs =
    useQuery(api.documents.getDocuments, { userId, portfolioId }) || [];
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDoc = useMutation(api.documents.uploadDocument);
  const updateName = useMutation(api.documents.updateFileName);
  const deleteDoc = useMutation(api.documents.deleteDocument);

  // Filter documents by search query
  const filteredDocs = searchQuery
    ? docs.filter((doc: { fileName: string; type?: string; _id: string }) => {
        const q = searchQuery.toLowerCase();
        return (
          doc.fileName.toLowerCase().includes(q) ||
          (doc.type && doc.type.toLowerCase().includes(q))
        );
      })
    : docs;

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await uploadDoc({
        storageId,
        userId: userId as Id<"users">,
        portfolioId: portfolioId as Id<"portfolios">,
        fileName: file.name,
      });
      toast.success("Uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRename = async (id: string) => {
    if (!newName.trim()) return;
    try {
      await updateName({
        documentId: id as Id<"userDocuments">,
        userId: userId as Id<"users">,
        fileName: newName,
      });
      setEditingId(null);
      setNewName("");
      toast.success("Renamed");
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc({
        documentId: id as Id<"userDocuments">,
        userId: userId as Id<"users">,
      });
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {filteredDocs.length === 0 ? (
        <p className="text-sm text-zinc-600 py-3">
          {searchQuery
            ? "No matching documents."
            : "No documents uploaded yet."}
        </p>
      ) : (
        filteredDocs.map(
          (doc: {
            _id: string;
            fileName: string;
            type?: string;
            url: string | null;
            size: number;
          }) => (
            <div
              key={doc._id}
              className="group flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <FileText className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                {editingId === doc._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                      className="text-sm bg-zinc-900 border border-white/[0.06] rounded px-2 py-0.5 text-white w-full focus:outline-none focus:border-white/[0.12]"
                    />
                    <button
                      onClick={() => handleRename(doc._id)}
                      className="p-1 text-emerald-500 hover:text-emerald-400"
                    >
                      <FloppyDisk className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setNewName("");
                      }}
                      className="p-1 text-zinc-500 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-zinc-300 truncate">
                      {doc.fileName}
                    </p>
                    <p className="text-[11px] text-zinc-600">
                      {(doc.size / 1024).toFixed(1)} KB
                    </p>
                  </>
                )}
              </div>
              {editingId !== doc._id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={doc.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <ArrowSquareOut className="h-3.5 w-3.5" />
                  </a>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                        <DotsThree className="h-3.5 w-3.5" weight="bold" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-zinc-950 border-white/[0.08]"
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingId(doc._id);
                          setNewName(doc.fileName);
                        }}
                        className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                      >
                        <PencilSimple className="h-3.5 w-3.5 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                      >
                        <Trash className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ),
        )
      )}
      <input
        ref={fileRef}
        type="file"
        onChange={handleUpload}
        className="hidden"
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mt-1 self-start disabled:opacity-40"
      >
        {isUploading ? (
          <CircleNotch className="h-3 w-3 animate-spin" />
        ) : (
          <Upload className="h-3 w-3" />
        )}
        {isUploading ? "Uploading..." : "Upload file"}
      </button>
    </div>
  );
}

/* ========================================================================== */
/*  VAULT CONTAINER                                                            */
/* ========================================================================== */
export function V2Vault({
  portfolioId,
  portfolioValue,
  annualReturn,
  userId,
}: V2VaultProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-5">
      {/* Search field */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vault — articles, documents..."
          className="w-full h-10 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 bg-zinc-900/60 border border-white/[0.06] rounded-lg focus:outline-none focus:border-white/[0.12] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Vault grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Goals */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Crosshair className="h-3.5 w-3.5 text-emerald-500" />
            <h3 className="text-sm font-semibold text-white">Goals</h3>
          </div>
          <GoalTracker
            portfolioId={portfolioId}
            portfolioValue={portfolioValue}
            annualReturn={annualReturn}
          />
        </div>

        {/* Articles */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="h-3.5 w-3.5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Research</h3>
          </div>
          {userId ? (
            <ArticlesList
              userId={userId}
              portfolioId={portfolioId}
              searchQuery={searchQuery}
            />
          ) : (
            <p className="text-sm text-zinc-600">Loading...</p>
          )}
        </div>

        {/* Documents */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Documents</h3>
          </div>
          {userId ? (
            <DocumentsList
              userId={userId}
              portfolioId={portfolioId}
              searchQuery={searchQuery}
            />
          ) : (
            <p className="text-sm text-zinc-600">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
