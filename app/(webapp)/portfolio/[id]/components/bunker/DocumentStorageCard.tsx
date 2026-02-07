"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  FileIcon,
  PlusCircle,
  Loader2,
  XCircle,
  Trash2,
  Pencil,
  Save,
  X,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface DocumentStorageCardProps {
  userId: string;
  portfolioId: string;
}

export function DocumentStorageCard({
  userId,
  portfolioId,
}: DocumentStorageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<"type" | "upload" | "confirm">(
    "type",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DOCUMENT_TYPES = [
    {
      id: "financial",
      label: "Financial Report",
      description: "Annual reports, earnings, financial statements",
    },
    {
      id: "legal",
      label: "Legal Document",
      description: "Contracts, agreements, regulatory filings",
    },
    {
      id: "research",
      label: "Research Document",
      description: "Analysis, due diligence, investment thesis",
    },
    {
      id: "other",
      label: "Other",
      description: "Miscellaneous documents",
    },
  ];

  const docs =
    useQuery(api.documents.getDocuments, {
      userId: userId,
      portfolioId: portfolioId,
    }) || [];
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDoc = useMutation(api.documents.uploadDocument);
  const updateDocFilename = useMutation(api.documents.updateFileName);
  const deleteDoc = useMutation(api.documents.deleteDocument);

  const resetUploadDialog = () => {
    setSelectedFile(null);
    setDocumentType("");
    setUploadStep("type");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStep("confirm");
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      const { storageId } = await result.json();

      // Step 3: Save the newly allocated storage id to the database
      await uploadDoc({
        storageId,
        userId: userId as Id<"users">,
        portfolioId: portfolioId as Id<"portfolios">,
        fileName: selectedFile.name,
      });

      toast.success("File uploaded successfully");
      setIsUploadDialogOpen(false);
      resetUploadDialog();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDoc({
          documentId: docId as Id<"userDocuments">,
          userId: userId as Id<"users">,
        });
        toast.success("Document deleted successfully");
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Failed to delete document. Please try again.");
      }
    }
  };

  const handleRenameDocument = async (docId: string, newName: string) => {
    try {
      await updateDocFilename({
        documentId: docId as Id<"userDocuments">,
        userId: userId as Id<"users">,
        fileName: newName,
      });
      setEditingDocId(null);
      setNewFileName("");
      toast.success("Document renamed successfully");
    } catch (error) {
      console.error("Error renaming document:", error);
      toast.error("Failed to rename document. Please try again.");
    }
  };

  return (
    <>
      <Card className="p-6 h-full relative">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <FileIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">Documents</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Store and access important financial documents related to this
            portfolio.
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-2xl md:min-w-3xl lg:min-w-5xl bg-zinc-950 border-white/[0.08] p-0">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <DialogTitle className="text-white text-base font-semibold">
              Portfolio Documents
            </DialogTitle>
          </div>
          <div className="px-6 pb-6 pt-4">
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Documents</h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" /> Upload Document
                </Button>
              </div>

              <div className="border rounded-md">
                {docs.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                    <FileIcon className="h-10 w-10 mb-2 opacity-40" />
                    <p>No documents uploaded yet.</p>
                    <p className="text-sm mt-1">
                      Upload a document to get started.
                    </p>
                  </div>
                ) : (
                  docs.map((doc: any, index: number) => (
                    <div
                      key={doc._id}
                      className={`py-3 px-4 flex items-center gap-3 ${
                        index !== docs.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <FileIcon className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        {editingDocId === doc._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              className="text-sm font-medium border border-input rounded-md px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-primary"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRenameDocument(doc._id, newFileName)
                              }
                              className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-50"
                              disabled={!newFileName.trim()}
                            >
                              <Save className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingDocId(null);
                                setNewFileName("");
                              }}
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm font-medium">{doc.fileName}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {(doc.size / 1024).toFixed(1)} KB • Updated{" "}
                          {new Date(doc.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            doc.url && window.open(doc.url, "_blank")
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-1" /> View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {editingDocId !== doc._id && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingDocId(doc._id);
                                  setNewFileName(doc.fileName);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500 focus:bg-red-50"
                              onClick={() => handleDeleteDocument(doc._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-zinc-600 italic">
                <span className="font-semibold">Note:</span> All documents are
                securely stored and encrypted. Only you have access to these
                files.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog
        open={isUploadDialogOpen}
        onOpenChange={(v) => {
          setIsUploadDialogOpen(v);
          if (!v) resetUploadDialog();
        }}
      >
        <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Upload Document</DialogTitle>
          {/* Step indicator */}
          <div className="flex items-center gap-0 border-b border-white/[0.06]">
            {["Type", "Upload", "Confirm"].map((s, i) => {
              const stepMap = ["type", "upload", "confirm"];
              const currentIdx = stepMap.indexOf(uploadStep);
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
            {uploadStep === "type" && (
              <>
                <div className="space-y-3">
                  {DOCUMENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setDocumentType(type.id);
                        setUploadStep("upload");
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
                      resetUploadDialog();
                      setIsUploadDialogOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <div></div>
                </div>
              </>
            )}

            {/* STEP 2: Upload */}
            {uploadStep === "upload" && (
              <>
                <div className="space-y-4">
                  <div className="text-center border-2 border-dashed border-white/[0.06] rounded-lg p-8">
                    <FileIcon className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-sm text-zinc-300 mb-2">
                      Click to select a file or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500">
                      Maximum file size: 10MB
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      resetUploadDialog();
                      setIsUploadDialogOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setUploadStep("type")}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Confirm */}
            {uploadStep === "confirm" && selectedFile && (
              <>
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <h3 className="text-sm font-medium text-white mb-3">
                      Upload Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-1">
                          Type
                        </p>
                        <p className="text-sm text-zinc-300">
                          {
                            DOCUMENT_TYPES.find((t) => t.id === documentType)
                              ?.label
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-1">
                          File Name
                        </p>
                        <p className="text-sm text-zinc-300">
                          {selectedFile.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-1">
                          File Size
                        </p>
                        <p className="text-sm text-zinc-300">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      resetUploadDialog();
                      setIsUploadDialogOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUploadStep("upload")}
                      className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="h-3.5 w-3.5" />
                          Upload Document
                        </>
                      )}
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
