import { useState } from "react";
import { User, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/services/api";

interface ProfileFormValues {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminProfile() {
  const { user, updateProfile, changePassword } = useAuth();
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
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      await updateProfile({ name: profileForm.name, email: profileForm.email });
      setProfileSuccess("Profile updated successfully");
    } catch (error) {
      setProfileError(getErrorMessage(error));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setPasswordLoading(true);

    try {
      await changePassword(profileForm.currentPassword, profileForm.newPassword);
      setPasswordSuccess("Password changed successfully");
      setProfileForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account settings</p>
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
              Profile
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
              Password
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-md">
              <div className="flex items-center gap-4">
                <div className="grid size-20 place-items-center rounded-xl bg-primary/10 text-primary">
                  <User className="size-10" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.role === "ADMIN" ? "Administrator" : "User"}</p>
                </div>
              </div>

              <FormField
                label="Name"
                htmlFor="profile-name"
                error={profileForm.name ? undefined : profileError}
              >
                <Input
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  disabled={profileLoading}
                />
              </FormField>

              <FormField
                label="Email"
                htmlFor="profile-email"
              >
                <Input
                  id="profile-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  disabled={profileLoading}
                />
              </FormField>

              {profileError && (
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
                />
              </FormField>

              <FormField
                label="New Password"
                htmlFor="new-password"
                hint="Must be at least 8 characters"
              >
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  value={profileForm.newPassword}
                  onChange={(e) => handleProfileChange("newPassword", e.target.value)}
                  disabled={passwordLoading}
                />
              </FormField>

              <FormField
                label="Confirm New Password"
                htmlFor="confirm-password"
              >
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => handleProfileChange("confirmPassword", e.target.value)}
                  disabled={passwordLoading}
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
  );
}