"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, Edit3, Flag, X, Check } from "lucide-react";
import { toast } from "sonner";

interface FlagFormData {
  key: string;
  description: string;
  enabled: boolean;
  environments: ("dev" | "prod")[];
  includeAllUsers: boolean;
  includeBetaUsers: boolean;
  includeCustomEmails: boolean;
  customEmails: string;
}

function FlagDialog({
  isOpen,
  onClose,
  onSuccess,
  editFlag = null,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editFlag?: any;
}) {
  const isEdit = !!editFlag;
  const [formData, setFormData] = useState<FlagFormData>({
    key: "",
    description: "",
    enabled: false,
    environments: [],
    includeAllUsers: true,
    includeBetaUsers: false,
    includeCustomEmails: false,
    customEmails: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createFlag = useMutation(api.flags.createFlag);
  const updateFlag = useMutation(api.flags.updateFlag);

  // Reset form data when editFlag changes
  useEffect(() => {
    if (!editFlag) {
      setFormData({
        key: "",
        description: "",
        enabled: false,
        environments: [],
        includeAllUsers: true,
        includeBetaUsers: false,
        includeCustomEmails: false,
        customEmails: "",
      });
      return;
    }

    const targeting = editFlag.targeting || [];
    const includeAllUsers = targeting.includes("all");
    const includeBetaUsers = targeting.includes("beta");
    const customEmails = targeting
      .filter((t: string) => !["all", "beta"].includes(t))
      .join(", ");
    const includeCustomEmails = customEmails.length > 0;

    setFormData({
      key: editFlag.key || "",
      description: editFlag.description || "",
      enabled: editFlag.enabled || false,
      environments: editFlag.environments || [],
      includeAllUsers,
      includeBetaUsers,
      includeCustomEmails,
      customEmails,
    });
  }, [editFlag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.key.trim() ||
      !formData.description.trim() ||
      formData.environments.length === 0
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      let finalTargeting: string[] = [];

      if (formData.includeAllUsers) {
        finalTargeting.push("all");
      }

      if (formData.includeBetaUsers) {
        finalTargeting.push("beta");
      }

      if (formData.includeCustomEmails && formData.customEmails.trim()) {
        const emails = formData.customEmails
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
        finalTargeting.push(...emails);
      }

      if (isEdit) {
        await updateFlag({
          id: editFlag._id,
          enabled: formData.enabled,
          description: formData.description.trim(),
          targeting: finalTargeting,
          environments: formData.environments,
        });
        toast.success(`Flag "${formData.key}" updated successfully`);
      } else {
        await createFlag({
          key: formData.key.trim(),
          enabled: formData.enabled,
          description: formData.description.trim(),
          targeting: finalTargeting,
          environments: formData.environments,
        });
        toast.success(`Flag "${formData.key}" created successfully`);
      }

      onSuccess();
      onClose();

      // Reset form if creating new
      if (!isEdit) {
        setFormData({
          key: "",
          description: "",
          enabled: false,
          environments: [],
          includeAllUsers: true,
          includeBetaUsers: false,
          includeCustomEmails: false,
          customEmails: "",
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEdit ? "update" : "create"} flag`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-xl border border-white/[0.06] bg-zinc-950 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {isEdit ? "Edit Feature Flag" : "Create Feature Flag"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Flag Key
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-white/[0.06] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/[0.08]"
              placeholder="new-feature-flag"
              disabled={isEdit}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-white/[0.06] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/[0.08] resize-none"
              placeholder="What does this flag control?"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Environments
            </label>
            <div className="space-y-2">
              {(["dev", "prod"] as const).map((env) => (
                <label key={env} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.environments.includes(env)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          environments: [...formData.environments, env],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          environments: formData.environments.filter(
                            (e) => e !== env,
                          ),
                        });
                      }
                    }}
                    className="rounded border-white/[0.06] bg-zinc-900 text-white focus:ring-white/[0.08]"
                  />
                  <span className="text-sm text-zinc-300 capitalize">
                    {env}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Targeting
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.includeAllUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      includeAllUsers: e.target.checked,
                    })
                  }
                  className="rounded border-white/[0.06] bg-zinc-900 text-white focus:ring-white/[0.08]"
                />
                <span className="text-sm text-zinc-300">All users</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.includeBetaUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      includeBetaUsers: e.target.checked,
                    })
                  }
                  className="rounded border-white/[0.06] bg-zinc-900 text-white focus:ring-white/[0.08]"
                />
                <span className="text-sm text-zinc-300">Beta users</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.includeCustomEmails}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      includeCustomEmails: e.target.checked,
                    })
                  }
                  className="rounded border-white/[0.06] bg-zinc-900 text-white focus:ring-white/[0.08]"
                />
                <span className="text-sm text-zinc-300">Specific emails</span>
              </label>
            </div>
            {formData.includeCustomEmails && (
              <textarea
                value={formData.customEmails}
                onChange={(e) =>
                  setFormData({ ...formData, customEmails: e.target.value })
                }
                className="w-full mt-2 px-3 py-2 bg-zinc-900 border border-white/[0.06] rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/[0.08] resize-none"
                placeholder="email1@example.com, email2@example.com"
                rows={2}
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
              {isEdit ? "Enabled" : "Initially Enabled"}
            </label>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, enabled: !formData.enabled })
              }
              className={`relative w-10 h-5 rounded-full transition-colors ${formData.enabled ? "bg-white" : "bg-white/[0.08]"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${formData.enabled ? "left-5 bg-black" : "left-0.5 bg-zinc-500"}`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-zinc-400 border border-white/[0.06] rounded-lg hover:text-white hover:border-white/[0.12] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.key.trim() ||
                !formData.description.trim() ||
                formData.environments.length === 0
              }
              className="flex-1 px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Flag"
                  : "Create Flag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FlagRow({
  flag,
  onEdit,
  onDelete,
}: {
  flag: any;
  onEdit: (flag: any) => void;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const updateFlag = useMutation(api.flags.updateFlag);

  const handleToggle = async () => {
    try {
      await updateFlag({
        id: flag._id,
        enabled: !flag.enabled,
      });
      toast.success(
        `Flag "${flag.key}" ${!flag.enabled ? "enabled" : "disabled"}`,
      );
    } catch (error) {
      toast.error("Failed to update flag");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete flag "${flag.key}"?`)) return;

    setIsDeleting(true);
    try {
      await onDelete(flag._id);
      toast.success(`Flag "${flag.key}" deleted`);
    } catch (error) {
      toast.error("Failed to delete flag");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-white/[0.06] bg-zinc-950/60">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <code className="text-sm font-mono text-white">{flag.key}</code>
          <div className="flex gap-1">
            {flag.environments?.map((env: string) => (
              <span
                key={env}
                className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/[0.08] text-zinc-400"
              >
                {env}
              </span>
            ))}
          </div>
          {flag.targeting && flag.targeting.length > 0 && (
            <div className="flex gap-1">
              {flag.targeting.includes("all") && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-500/[0.2] text-blue-300">
                  all
                </span>
              )}
              {flag.targeting.includes("beta") && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-yellow-500/[0.2] text-yellow-300">
                  beta
                </span>
              )}
              {flag.targeting.filter(
                (t: string) => !["all", "beta"].includes(t),
              ).length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-500/[0.2] text-purple-300">
                  {
                    flag.targeting.filter(
                      (t: string) => !["all", "beta"].includes(t),
                    ).length
                  }{" "}
                  emails
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-zinc-400 truncate">{flag.description}</p>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={handleToggle}
          className={`relative w-10 h-5 rounded-full transition-colors ${flag.enabled ? "bg-green-500" : "bg-white/[0.08]"}`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${flag.enabled ? "left-5 bg-white" : "left-0.5 bg-zinc-500"}`}
          />
        </button>

        <button
          onClick={() => onEdit(flag)}
          className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/[0.08] rounded-lg transition-colors"
        >
          <Edit3 className="h-4 w-4" />
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.08] rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function FeatureFlagsManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<any>(null);

  const flags = useQuery(api.flags.getAllFlags);
  const deleteFlag = useMutation(api.flags.deleteFlag);

  const handleDeleteFlag = async (id: string) => {
    await deleteFlag({ id });
  };

  const handleEditFlag = (flag: any) => {
    setEditingFlag(flag);
    setIsEditDialogOpen(true);
  };

  const enabledFlags = flags?.filter((flag) => flag.enabled).length ?? 0;
  const totalFlags = flags?.length ?? 0;

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-10">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-1">
            Feature Management
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Feature Flags
          </h1>
          <p className="text-zinc-400 mt-2">
            Manage feature toggles and rollouts across environments
          </p>
        </div>

        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Flag
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-4">
          <div className="text-2xl font-bold text-white">{totalFlags}</div>
          <div className="text-xs text-zinc-400">Total Flags</div>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-4">
          <div className="text-2xl font-bold text-green-400">
            {enabledFlags}
          </div>
          <div className="text-xs text-zinc-400">Enabled</div>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-4">
          <div className="text-2xl font-bold text-zinc-400">
            {totalFlags - enabledFlags}
          </div>
          <div className="text-xs text-zinc-400">Disabled</div>
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {flags?.length === 0 && (
          <div className="text-center py-12">
            <Flag className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No feature flags
            </h3>
            <p className="text-zinc-400 mb-6">
              Create your first feature flag to get started
            </p>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium"
            >
              Create Flag
            </button>
          </div>
        )}

        {flags?.map((flag) => (
          <FlagRow
            key={flag._id}
            flag={flag}
            onEdit={handleEditFlag}
            onDelete={handleDeleteFlag}
          />
        ))}
      </div>

      {/* Dialogs */}
      <FlagDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          // Flags will automatically refetch due to Convex reactivity
        }}
      />

      <FlagDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingFlag(null);
        }}
        onSuccess={() => {
          // Flags will automatically refetch due to Convex reactivity
        }}
        editFlag={editingFlag}
      />
    </div>
  );
}
