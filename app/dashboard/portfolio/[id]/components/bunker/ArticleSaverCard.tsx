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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleUrl, setNewArticleUrl] = useState("");
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

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAddArticle = async () => {
    if (!newArticleTitle.trim()) {
      setFormError("Title is required");
      return;
    }

    if (!newArticleUrl.trim() || !validateUrl(newArticleUrl)) {
      setFormError("Valid URL is required");
      return;
    }

    try {
      await addArticle({
        userId: userId as Id<"users">,
        portfolioId: portfolioId as Id<"portfolios">,
        title: newArticleTitle,
        url: newArticleUrl,
      });
      toast.success("Article saved successfully");
      setIsAddDialogOpen(false);
      setNewArticleTitle("");
      setNewArticleUrl("");
      setFormError("");
    } catch (error) {
      console.error("Failed to save article:", error);
      toast.error("Failed to save article. Please try again.");
    }
  };

  const handleEditArticle = async () => {
    if (!currentArticle) return;

    if (!editArticleUrl.trim() || !validateUrl(editArticleUrl)) {
      setFormError("Valid URL is required");
      return;
    }

    try {
      await updateArticleUrl({
        articleId: currentArticle._id as Id<"userArticles">,
        userId: userId as Id<"users">,
        newUrl: editArticleUrl,
      });
      toast.success("Article updated successfully");
      setIsEditDialogOpen(false);
      setCurrentArticle(null);
      setEditArticleUrl("");
      setFormError("");
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
                    articles.map((article) => (
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
                                  onClick={() => openEditDialog(article)}
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Article</DialogTitle>
            <DialogDescription>
              Save an article or research paper for future reference.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="article-title">Article Title</Label>
              <Input
                id="article-title"
                placeholder="Enter article title"
                value={newArticleTitle}
                onChange={(e) => setNewArticleTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-url">Article URL</Label>
              <Input
                id="article-url"
                placeholder="https://example.com/article"
                value={newArticleUrl}
                onChange={(e) => setNewArticleUrl(e.target.value)}
              />
            </div>

            {formError && (
              <p className="text-sm font-medium text-destructive">
                {formError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewArticleTitle("");
                  setNewArticleUrl("");
                  setFormError("");
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleAddArticle}>
                Save Article
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>Update article details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-article-title">Article Title</Label>
              <Input
                id="edit-article-title"
                value={currentArticle?.title || ""}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-article-url">Article URL</Label>
              <Input
                id="edit-article-url"
                placeholder="https://example.com/article"
                value={editArticleUrl}
                onChange={(e) => setEditArticleUrl(e.target.value)}
              />
            </div>

            {formError && (
              <p className="text-sm font-medium text-destructive">
                {formError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setCurrentArticle(null);
                  setEditArticleUrl("");
                  setFormError("");
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleEditArticle}>
                Update Article
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
