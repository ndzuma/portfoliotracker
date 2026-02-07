"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/index";
import {
  BookIcon,
  LinkIcon,
  PlusCircle,
  Pencil,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Check,
  FileText,
  Newspaper,
  TrendingUp,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ArticleSaverCardProps {
  title?: string;
  userId: string;
  portfolioId: string;
}

export function ArticleSaverCard({
  title = "Research Articles",
  userId,
  portfolioId,
}: ArticleSaverCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addStep, setAddStep] = useState<"type" | "details" | "confirm">(
    "type",
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStep, setEditStep] = useState<"details" | "confirm">("details");
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleUrl, setNewArticleUrl] = useState("");
  const [articleType, setArticleType] = useState("");
  const [editArticleUrl, setEditArticleUrl] = useState("");
  const [formError, setFormError] = useState("");

  const articles =
    useQuery(api.articles.getArticles, {
      userId: userId,
      portfolioId: portfolioId,
    }) || [];

  const addArticle = useMutation(api.articles.saveArticle);
  const deleteArticle = useMutation(api.articles.deleteArticle);
  const updateArticleUrl = useMutation(api.articles.editArticleUrl);

  const ARTICLE_TYPES = [
    {
      id: "research",
      label: "Research Paper",
      icon: FileText,
      color: "text-blue-400 bg-blue-500/10",
      description: "In-depth analysis or studies",
    },
    {
      id: "news",
      label: "News Article",
      icon: Newspaper,
      color: "text-emerald-400 bg-emerald-500/10",
      description: "Market news or company updates",
    },
    {
      id: "analysis",
      label: "Market Analysis",
      icon: TrendingUp,
      color: "text-amber-400 bg-amber-500/10",
      description: "Financial reports or earnings",
    },
  ];

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const resetAddDialog = () => {
    setAddStep("type");
    setArticleType("");
    setNewArticleTitle("");
    setNewArticleUrl("");
    setFormError("");
  };

  const resetEditDialog = () => {
    setEditStep("details");
    setCurrentArticle(null);
    setEditArticleUrl("");
    setFormError("");
  };

  const handleAddArticle = async () => {
    try {
      const selectedType = ARTICLE_TYPES.find((t) => t.id === articleType);
      await addArticle({
        userId: userId as Id<"users">,
        portfolioId: portfolioId as Id<"portfolios">,
        title: newArticleTitle,
        url: newArticleUrl,
      });
      toast.success("Article saved successfully");
      setIsAddDialogOpen(false);
      resetAddDialog();
    } catch (error) {
      console.error("Failed to save article:", error);
      toast.error("Failed to save article. Please try again.");
    }
  };

  const handleEditArticle = async () => {
    if (!currentArticle) return;

    try {
      await updateArticleUrl({
        articleId: currentArticle._id as Id<"userArticles">,
        userId: userId as Id<"users">,
        newUrl: editArticleUrl,
      });
      toast.success("Article updated successfully");
      setIsEditDialogOpen(false);
      resetEditDialog();
    } catch (error) {
      console.error("Failed to update article:", error);
      toast.error("Failed to update article. Please try again.");
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteArticle({
          articleId: articleId as Id<"userArticles">,
          userId: userId as Id<"users">,
        });
        toast.success("Article deleted successfully");
      } catch (error) {
        console.error("Failed to delete article:", error);
        toast.error("Failed to delete article. Please try again.");
      }
    }
  };

  const openEditDialog = (article: any) => {
    setCurrentArticle(article);
    setEditArticleUrl(article.url);
    setIsEditDialogOpen(true);
  };

  const canProceedAdd = () => {
    if (addStep === "type") return articleType;
    if (addStep === "details")
      return newArticleTitle.trim() && newArticleUrl.trim();
    return true;
  };

  const canProceedEdit = () => {
    if (editStep === "details") return editArticleUrl.trim();
    return true;
  };

  return (
    <>
      <Card className="p-6 h-full relative">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <BookIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Save and organize research articles and news relevant to your
            investments.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="mt-2 opacity-70 hover:opacity-100 transition-opacity self-start flex items-center"
          >
            Expand
          </Button>
        </div>
      </Card>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-2xl md:min-w-3xl lg:min-w-5xl">
          <DialogHeader>
            <DialogTitle>Research & Articles</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Saved Articles</h3>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4" /> Add New
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <BookIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p>No articles saved yet.</p>
                        <p className="text-sm mt-1">
                          Add your first article to get started.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    articles.map((article: any) => (
                      <TableRow key={article._id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{article.title}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <LinkIcon className="h-3 w-3" />
                              {new URL(article.url).hostname}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {article._creationTime
                            ? new Date(
                                article._creationTime,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(article.url, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" /> View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <circle cx="8" cy="8" r="1" />
                                    <circle cx="8" cy="4" r="1" />
                                    <circle cx="8" cy="12" r="1" />
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(article as any)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-500 focus:text-red-500 focus:bg-red-50"
                                  onClick={() =>
                                    handleDeleteArticle(article._id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">Tip:</span> Save important
              research articles and news to keep track of information relevant
              to your investments.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Article Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(v) => {
          setIsAddDialogOpen(v);
          if (!v) resetAddDialog();
        }}
      >
        <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Add New Article</DialogTitle>
          {/* Step indicator */}
          <div className="flex items-center gap-0 border-b border-white/[0.06]">
            {["Type", "Details", "Confirm"].map((s, i) => {
              const stepMap = ["type", "details", "confirm"];
              const currentIdx = stepMap.indexOf(addStep);
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div
                  key={s}
                  className={`flex-1 py-3 text-center text-[11px] font-medium uppercase tracking-wider transition-colors ${isActive ? "text-white bg-white/[0.04]" : isDone ? "text-zinc-500" : "text-zinc-700"}`}
                >
                  {s}
                </div>
              );
            })}
          </div>

          <div className="px-6 pb-6 pt-4">
            {/* STEP 1: Type Selection */}
            {addStep === "type" && (
              <>
                <div className="space-y-3">
                  {ARTICLE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setArticleType(type.id);
                        setAddStep("details");
                      }}
                      className="w-full flex items-start gap-3 p-4 rounded-lg border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all text-left"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {type.label}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      resetAddDialog();
                      setIsAddDialogOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <div></div>
                </div>
              </>
            )}

            {/* STEP 2: Details */}
            {addStep === "details" && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                      Article Title
                    </Label>
                    <Input
                      value={newArticleTitle}
                      onChange={(e) => setNewArticleTitle(e.target.value)}
                      placeholder="Enter article title"
                      className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                      Article URL
                    </Label>
                    <Input
                      value={newArticleUrl}
                      onChange={(e) => setNewArticleUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                    />
                  </div>

                  {formError && (
                    <p className="text-sm font-medium text-destructive">
                      {formError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      resetAddDialog();
                      setIsAddDialogOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddStep("type")}
                      className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setAddStep("confirm")}
                      disabled={
                        !newArticleTitle.trim() || !newArticleUrl.trim()
                      }
                      className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Review Details
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Confirm */}
            {addStep === "confirm" && (
              <>
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <h3 className="text-sm font-medium text-white mb-3">
                      Article Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-1">
                          Type
                        </p>
                        <p className="text-sm text-zinc-300">
                          {
                            ARTICLE_TYPES.find((t) => t.id === articleType)
                              ?.label
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-1">
                          Title
                        </p>
                        <p className="text-sm text-zinc-300">
                          {newArticleTitle}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-1">
                          URL
                        </p>
                        <p className="text-sm text-zinc-300 break-all">
                          {newArticleUrl}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      resetAddDialog();
                      setIsAddDialogOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddStep("details")}
                      className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddArticle}
                      className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors flex items-center gap-2"
                    >
                      Save Article
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(v) => {
          setIsEditDialogOpen(v);
          if (!v) {
            setCurrentArticle(null);
            resetEditDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Edit Article</DialogTitle>
          {/* Step indicator */}
          <div className="flex items-center gap-0 border-b border-white/[0.06]">
            {["Details", "Confirm"].map((s, i) => {
              const stepMap = ["details", "confirm"];
              const currentIdx = stepMap.indexOf(editStep);
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div
                  key={s}
                  className={`flex-1 py-3 text-center text-[11px] font-medium uppercase tracking-wider transition-colors ${isActive ? "text-white bg-white/[0.04]" : isDone ? "text-zinc-500" : "text-zinc-700"}`}
                >
                  {s}
                </div>
              );
            })}
          </div>

          <div className="px-6 pb-6 pt-4">
            {/* STEP 1: Details */}
            {editStep === "details" && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                      Article Title
                    </Label>
                    <Input
                      value={currentArticle?.title || ""}
                      disabled
                      className="bg-zinc-800 border-white/[0.06] text-zinc-400 h-10 text-sm"
                    />
                    <p className="text-xs text-zinc-600">
                      Title cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                      Article URL
                    </Label>
                    <Input
                      value={editArticleUrl}
                      onChange={(e) => setEditArticleUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                      autoFocus
                    />
                  </div>

                  {formError && (
                    <p className="text-sm font-medium text-destructive">
                      {formError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setCurrentArticle(null);
                      resetEditDialog();
                    }}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setEditStep("confirm")}
                    disabled={!editArticleUrl.trim()}
                    className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Review Changes
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Confirm */}
            {editStep === "confirm" && (
              <>
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <h3 className="text-sm font-medium text-white mb-3">
                      Updated Article Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-1">
                          Title
                        </p>
                        <p className="text-sm text-zinc-300">
                          {currentArticle?.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-1">
                          URL
                        </p>
                        <div className="flex flex-col gap-1">
                          {editArticleUrl !== currentArticle?.url &&
                            currentArticle?.url && (
                              <span className="text-xs text-zinc-500 line-through break-all">
                                {currentArticle.url}
                              </span>
                            )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-300 break-all">
                              {editArticleUrl}
                            </span>
                            {editArticleUrl !== currentArticle?.url && (
                              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Updated
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setCurrentArticle(null);
                      resetEditDialog();
                    }}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditStep("details")}
                      className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleEditArticle}
                      className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors flex items-center gap-2"
                    >
                      Update Article
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
