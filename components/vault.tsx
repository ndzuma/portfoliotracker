"use client";

import {
  useState,
  useRef,
  FormEvent,
  ChangeEvent,
  useEffect,
  DragEvent,
  useCallback,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
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
  CloudArrowUp,
  File,
  CheckCircle,
  NotePencil,
  CaretRight,
  CaretLeft,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  userId?: string;
}

/* ---------- CONSTANTS ---------- */
const DOCUMENT_TYPES = [
  "Strategy Document",
  "Account Statement",
  "Portfolio Thesis",
  "Research Report",
  "Annual Report",
  "Tax Document",
  "Other",
] as const;

type DocumentType = (typeof DOCUMENT_TYPES)[number];

const DOC_TYPE_ICONS: Record<DocumentType, string> = {
  "Strategy Document": "📐",
  "Account Statement": "📊",
  "Portfolio Thesis": "📝",
  "Research Report": "🔬",
  "Annual Report": "📈",
  "Tax Document": "🧾",
  Other: "📄",
};

/* ========================================================================== */
/*  ARTICLES                                                                    */
/* ========================================================================== */

interface ArticleItem {
  _id: string;
  title: string;
  url: string;
  notes?: string;
}

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
  const [editOpen, setEditOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  /* Edit form state */
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const articles =
    useQuery(api.articles.getArticles, { userId, portfolioId }) || [];
  const addArticle = useMutation(api.articles.saveArticle);
  const updateArticle = useMutation(api.articles.updateArticle);
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
        notes: notes.trim() || undefined,
      });
      setTitle("");
      setUrl("");
      setNotes("");
      setAddOpen(false);
      toast.success("Article saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleEdit = async () => {
    if (!editingArticle || !editTitle.trim() || !editUrl.trim()) return;
    try {
      await updateArticle({
        articleId: editingArticle._id as Id<"userArticles">,
        userId: userId as Id<"users">,
        title: editTitle,
        url: editUrl,
        notes: editNotes.trim() || undefined,
      });
      setEditOpen(false);
      setEditingArticle(null);
      toast.success("Article updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const openEditDialog = (article: ArticleItem) => {
    setEditingArticle(article);
    setEditTitle(article.title);
    setEditUrl(article.url);
    setEditNotes(article.notes || "");
    setEditOpen(true);
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
          filteredArticles.map((a: ArticleItem) => (
            <div
              key={a._id}
              className="group flex items-start gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
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
                {a.notes && (
                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed italic">
                    {a.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => openEditDialog(a)}
                  className="p-1.5 rounded-md text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  title="Edit article"
                >
                  <PencilSimple className="h-3.5 w-3.5" />
                </button>
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
          ))
        )}
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mt-1 self-start"
        >
          <Plus className="h-3 w-3" /> Add article
        </button>
      </div>

      {/* ---- ADD ARTICLE DIALOG ---- */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[440px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
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
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">
                  Notes{" "}
                  <span className="text-zinc-600 font-normal">(optional)</span>
                </Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key takeaways, thoughts..."
                  rows={3}
                  className="bg-zinc-900 border border-white/[0.06] text-white text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-white/[0.12] transition-colors placeholder:text-zinc-600"
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

      {/* ---- EDIT ARTICLE DIALOG ---- */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingArticle(null);
        }}
      >
        <DialogContent className="sm:max-w-[440px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <DialogTitle className="text-white text-base font-semibold">
              Edit Article
            </DialogTitle>
          </div>
          <div className="px-6 pb-6 pt-5">
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Article title"
                  className="bg-zinc-900 border-white/[0.06] text-white h-9"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">URL</Label>
                <Input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-zinc-900 border-white/[0.06] text-white h-9"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">
                  Notes{" "}
                  <span className="text-zinc-600 font-normal">(optional)</span>
                </Label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Key takeaways, thoughts..."
                  rows={3}
                  className="bg-zinc-900 border border-white/[0.06] text-white text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-white/[0.12] transition-colors placeholder:text-zinc-600"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 mt-3 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditingArticle(null);
                }}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={!editTitle.trim() || !editUrl.trim()}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Update Article
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ========================================================================== */
/*  DOCUMENT UPLOAD DIALOG                                                     */
/* ========================================================================== */

function UploadDocumentDialog({
  open,
  onOpenChange,
  userId,
  portfolioId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  portfolioId: string;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>("Other");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDoc = useMutation(api.documents.uploadDocument);

  const resetState = () => {
    setStep(1);
    setFile(null);
    setDocType("Other");
    setIsDragOver(false);
    setIsUploading(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
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
        type: docType,
      });
      toast.success("Document uploaded");
      handleClose(false);
    } catch {
      toast.error("Upload failed");
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (name: string): string => {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
        {/* Header with step indicators */}
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <DialogTitle className="text-white text-base font-semibold mb-3">
            Upload Document
          </DialogTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  step >= 1
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-zinc-500"
                }`}
              >
                1
              </div>
              <span
                className={`text-[11px] font-medium ${step >= 1 ? "text-white" : "text-zinc-600"}`}
              >
                Select File
              </span>
            </div>
            <div className="w-6 h-px bg-white/[0.08]" />
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  step >= 2
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-zinc-500"
                }`}
              >
                2
              </div>
              <span
                className={`text-[11px] font-medium ${step >= 2 ? "text-white" : "text-zinc-600"}`}
              >
                Confirm
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <AnimatePresence mode="wait">
            {/* ---- STEP 1: SELECT FILE + TYPE ---- */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
              >
                {/* Drag and drop zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? "border-white/[0.25] bg-white/[0.04]"
                      : file
                        ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                        : "border-white/[0.08] bg-white/[0.01] hover:border-white/[0.12] hover:bg-white/[0.02]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleInputChange}
                    className="hidden"
                  />

                  {file ? (
                    <>
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle
                          className="h-5 w-5 text-emerald-400"
                          weight="fill"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-white font-medium truncate max-w-[280px]">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {getFileExtension(file.name)} ·{" "}
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="text-[11px] text-zinc-500 hover:text-white transition-colors underline underline-offset-2"
                      >
                        Choose different file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center">
                        <CloudArrowUp className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-zinc-300">
                          <span className="text-white font-medium">
                            Click to browse
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          PDF, DOCX, XLSX, CSV, TXT — up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Document type selector */}
                <div className="mt-5">
                  <Label className="text-xs text-zinc-400 mb-2 block">
                    Document Type
                  </Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DOCUMENT_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setDocType(type)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all duration-150 ${
                          docType === type
                            ? "bg-white/[0.08] text-white border border-white/[0.12]"
                            : "bg-white/[0.02] text-zinc-400 border border-white/[0.04] hover:border-white/[0.08] hover:text-zinc-300"
                        }`}
                      >
                        <span className="text-sm leading-none">
                          {DOC_TYPE_ICONS[type]}
                        </span>
                        <span className="truncate">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 1 footer */}
                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleClose(false)}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!file}
                    className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <CaretRight className="h-3.5 w-3.5" weight="bold" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---- STEP 2: CONFIRM ---- */}
            {step === 2 && file && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.15 }}
              >
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-4">
                    Upload Summary
                  </p>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <File className="h-5 w-5 text-amber-400" weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {file.name}
                      </p>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500">
                            Format
                          </span>
                          <span className="text-[11px] text-zinc-300 font-medium">
                            {getFileExtension(file.name)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500">
                            Size
                          </span>
                          <span className="text-[11px] text-zinc-300 font-medium">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500">
                            Type
                          </span>
                          <span className="text-[11px] text-zinc-300 font-medium flex items-center gap-1.5">
                            <span>{DOC_TYPE_ICONS[docType]}</span>
                            {docType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 footer */}
                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => setStep(1)}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
                  >
                    <CaretLeft className="h-3.5 w-3.5" weight="bold" />
                    Back
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <CircleNotch className="h-3.5 w-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        Upload Document
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const docs =
    useQuery(api.documents.getDocuments, { userId, portfolioId }) || [];
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
    <>
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
                        {doc.type && doc.type !== "Other" ? (
                          <span className="text-zinc-500">{doc.type} · </span>
                        ) : null}
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
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mt-1 self-start"
        >
          <Upload className="h-3 w-3" /> Upload file
        </button>
      </div>

      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        userId={userId}
        portfolioId={portfolioId}
      />
    </>
  );
}

/* ========================================================================== */
/*  VAULT CONTAINER                                                            */
/* ========================================================================== */
export function V2Vault({ portfolioId, userId }: V2VaultProps) {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
