import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Lock, Save, ArrowLeft, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/services/api";
import { formatDate } from "@/lib/format";

interface ProfileFormValues {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const { user, updateProfile, changePassword, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileFormValues>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (field: keyof ProfileFormValues, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setProfileError("");
    setProfileSuccess("");
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileLoading) return;

    const hasChanges = profileForm.name !== user?.name || profileForm.email !== user?.email;
    if (!hasChanges) {
      setProfileSuccess("No changes to save");
      return;
    }

    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      await updateProfile({ name: profileForm.name, email: profileForm.email });
      setProfileSuccess("Profile updated successfully");
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const validationError = error as { errors: { field: string; message: string }[] };
        const fieldErrors = validationError.errors;
        if (fieldErrors.length > 0) {
          setProfileError(fieldErrors.map((e) => e.message).join(", "));
        } else {
          setProfileError(getErrorMessage(error));
        }
      } else {
        setProfileError(getErrorMessage(error));
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordLoading) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (profileForm.newPassword !== profileForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (profileForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (profileForm.currentPassword === profileForm.newPassword) {
      setPasswordError("The new password must be different from the current password");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(profileForm.currentPassword, profileForm.newPassword);
      setPasswordSuccess("Password changed successfully. Redirecting to sign in...");
      setProfileForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const validationError = error as { errors: { field: string; message: string }[] };
        const fieldErrors = validationError.errors;
        if (fieldErrors.length > 0) {
          setPasswordError(fieldErrors.map((e) => e.message).join(", "));
        } else {
          setPasswordError(getErrorMessage(error));
        }
      } else {
        setPasswordError(getErrorMessage(error));
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading) {
    return (
      <section className="page-container py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-6" aria-busy="true">
            <div className="h-8 animate-pulse rounded-lg bg-muted" />
            <div className="h-64 animate-pulse rounded-2xl border bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-container py-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-muted-foreground">Please sign in to access your profile.</p>
          <Link to="/login" className="mt-4 inline-block">
            <Button>Sign in</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/account" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="mt-1 text-muted-foreground">Manage your account settings</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="border-b p-4">
            <div className="flex gap-4" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="size-4 mr-2 inline" aria-hidden="true" />
                Personal Information
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "password"}
                onClick={() => setActiveTab("password")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "password"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lock className="size-4 mr-2 inline" aria-hidden="true" />
                Security
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-md">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="grid size-16 place-items-center rounded-xl bg-primary/10 text-primary">
                    <User className="size-8" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="profile-role" className="text-sm font-medium">
                      Role
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground">
                      <Shield className="size-4" aria-hidden="true" />
                      <span>{user.role === "ADMIN" ? "Administrator" : "Customer"}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="profile-created" className="text-sm font-medium">
                      Member since
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground">
                      <Calendar className="size-4" aria-hidden="true" />
                      <span>{user.createdAt ? formatDate(user.createdAt) : "Unknown"}</span>
                    </div>
                  </div>
                </div>

                <FormField
                  label="Name"
                  htmlFor="profile-name"
                  error={profileError && profileForm.name === "" ? profileError : undefined}
                >
                  <Input
                    id="profile-name"
                    value={profileForm.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    disabled={profileLoading}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </FormField>

                <FormField
                  label="Email"
                  htmlFor="profile-email"
                  error={profileError && profileForm.email === "" ? profileError : undefined}
                >
                  <Input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    disabled={profileLoading}
                    required
                  />
                </FormField>

                {profileError && !profileForm.name && !profileForm.email && (
                  <p role="alert" className="text-sm text-destructive">{profileError}</p>
                )}
                {profileError && (profileForm.name || profileForm.email) && (
                  <p role="alert" className="text-sm text-destructive">{profileError}</p>
                )}
                {profileSuccess && (
                  <p role="status" className="text-sm text-success">{profileSuccess}</p>
                )}

                <Button type="submit" loading={profileLoading} className="w-full sm:w-auto">
                  <Save className="size-4 mr-2" aria-hidden="true" />
                  Save Changes
                </Button>
              </form>
            )}

            {activeTab === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                <p className="text-sm text-muted-foreground">
                  Your current session will be invalidated after changing your password. You will need to sign in again.
                </p>

                <FormField
                  label="Current Password"
                  htmlFor="current-password"
                  error={passwordError}
                >
                  <PasswordInput
                    id="current-password"
                    autoComplete="current-password"
                    value={profileForm.currentPassword}
                    onChange={(e) => handleProfileChange("currentPassword", e.target.value)}
                    disabled={passwordLoading}
                    required
                  />
                </FormField>

                <FormField
                  label="New Password"
                  htmlFor="new-password"
                  hint="Must be at least 8 characters"
                  error={passwordError}
                >
                  <PasswordInput
                    id="new-password"
                    autoComplete="new-password"
                    value={profileForm.newPassword}
                    onChange={(e) => handleProfileChange("newPassword", e.target.value)}
                    disabled={passwordLoading}
                    required
                    minLength={8}
                  />
                </FormField>

                <FormField
                  label="Confirm New Password"
                  htmlFor="confirm-password"
                  error={passwordError}
                >
                  <PasswordInput
                    id="confirm-password"
                    autoComplete="new-password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => handleProfileChange("confirmPassword", e.target.value)}
                    disabled={passwordLoading}
                    required
                  />
                </FormField>

                {passwordError && (
                  <p role="alert" className="text-sm text-destructive">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p role="status" className="text-sm text-success">{passwordSuccess}</p>
                )}

                <Button type="submit" loading={passwordLoading} className="w-full sm:w-auto">
                  <Lock className="size-4 mr-2" aria-hidden="true" />
                  Change Password
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}