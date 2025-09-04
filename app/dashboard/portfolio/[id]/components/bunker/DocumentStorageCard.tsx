"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileIcon,
  PlusCircle,
  Loader2,
  XCircle,
  Download,
  Trash2,
  Pencil,
  Save,
  X,
  Filter,
  FileType,
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docs =
    useQuery(api.documents.getDocuments, {
      userId: userId,
      portfolioId: portfolioId,
    }) || [];
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDoc = useMutation(api.documents.uploadDocument);
  const updateDocFilename = useMutation(api.documents.updateFileName);
  const deleteDoc = useMutation(api.documents.deleteDocument);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (e: FormEvent) => {
    e.preventDefault();

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

      // Reset the file input
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("File uploaded successfully");
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-2xl md:min-w-3xl lg:min-w-5xl">
          <DialogHeader>
            <DialogTitle>Portfolio Documents</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Documents</h3>
              <div className="flex items-center gap-2">
                {selectedFile && (
                  <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                    <FileIcon className="h-3 w-3 text-primary" />
                    <span className="text-xs truncate max-w-[150px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <PlusCircle className="h-4 w-4" /> Select File
                </Button>
                <Button
                  size="sm"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className={
                    selectedFile
                      ? "bg-primary"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
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
                docs.map((doc, index) => (
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
                        onClick={() => window.open(doc.url, "_blank")}
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

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">Note:</span> All documents are
              securely stored and encrypted. Only you have access to these
              files.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
