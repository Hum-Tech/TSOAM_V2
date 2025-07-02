import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Church,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Loader2,
  UserPlus,
  Key,
  User,
  Phone,
  Building,
} from "lucide-react";

export default function Login() {
  const {
    isAuthenticated,
    login,
    isLoading,
    requireOTP,
    user,
    createAccount,
    validateDate,
    getAllUsers,
    changeUserPassword,
  } = useAuth();

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [attemptingLogin, setAttemptingLogin] = useState(false);

  // Create account states
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [createAccountForm, setCreateAccountForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    employeeId: "",
    temporaryPassword: "",
  });

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: code, 3: new password

  // Check if current user is admin
  const isAdmin =
    user?.role === "Admin" &&
    (user?.canCreateAccounts || user?.canDeleteAccounts);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAttemptingLogin(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setAttemptingLogin(false);
      return;
    }

    if (requireOTP && !otp) {
      setError("Please enter the OTP sent to your email");
      setAttemptingLogin(false);
      return;
    }

    const success = await login(email, password, otp, rememberMe);

    if (!success) {
      if (requireOTP && !otp) {
        setError("OTP has been sent to your email. Please enter it below.");
      } else if (requireOTP && otp) {
        setError("Invalid OTP. Please check and try again.");
      } else {
        setError("Invalid email or password");
      }
    }

    setAttemptingLogin(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !createAccountForm.fullName ||
      !createAccountForm.email ||
      !createAccountForm.role
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createAccountForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Send account creation request to backend for verification
      const response = await fetch("/api/auth/users/create-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createAccountForm.fullName,
          email: createAccountForm.email,
          phone: createAccountForm.phone,
          role: createAccountForm.role,
          department: createAccountForm.department,
          employee_id: createAccountForm.employeeId,
          requested_by: user?.name || "Login Form",
          ip_address: window.location.hostname,
          request_reason: "New user account creation request",
        }),
      });

      // Check if response is ok before trying to read body
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clone response to avoid body stream issues
      const responseClone = response.clone();
      let result;

      try {
        result = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, try with the cloned response
        console.warn(
          "JSON parsing failed, trying with cloned response:",
          jsonError,
        );
        result = await responseClone.json();
      }

      if (result.success) {
        // Reset form
        setCreateAccountForm({
          fullName: "",
          email: "",
          phone: "",
          role: "",
          department: "",
          employeeId: "",
          temporaryPassword: "",
        });
        setShowCreateAccount(false);

        const demoNote = result.demo
          ? "\n\n(Demo Mode - Database Offline)"
          : "";
        alert(
          `✅ ACCOUNT REQUEST SUBMITTED!\n\n📋 Request Details:\n• Name: ${createAccountForm.fullName}\n• Email: ${createAccountForm.email}\n• Role: ${createAccountForm.role}\n\n⚠️ NEXT STEPS:\n• Your request has been sent to administrators\n• Check the Users module for verification status\n• You will receive login credentials once approved\n\n💡 Administrators can approve/reject requests in the User Management section.${demoNote}`,
        );

        // Log the activity (non-blocking)
        fetch("/api/system-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "Account Creation Request",
            module: "Authentication",
            details: `New account request for ${createAccountForm.fullName} (${createAccountForm.email}) - Role: ${createAccountForm.role}`,
            severity: "Info",
          }),
        }).catch((logError) => {
          console.warn("System logging failed:", logError);
        });
      } else {
        setError(result.error || "Failed to submit account request");
      }
    } catch (error) {
      console.error("Account creation request error:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to submit account request. Please try again.";
      if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message.includes("body stream already read")) {
        errorMessage = "Request processing error. Please try again.";
      } else if (error.message.includes("HTTP error")) {
        errorMessage = `Server error: ${error.message}`;
      }

      setError(errorMessage);

      // Fallback to original create account if API fails
      try {
        const result = await createAccount(createAccountForm);
        if (result.success && result.credentials) {
          setCreateAccountForm({
            fullName: "",
            email: "",
            phone: "",
            role: "",
            department: "",
            employeeId: "",
            temporaryPassword: "",
          });
          setShowCreateAccount(false);
          alert(
            "Account created successfully! Please contact admin for activation.",
          );
        } else {
          setError("Failed to create account. Please try again.");
        }
      } catch (fallbackError) {
        console.error("Fallback account creation failed:", fallbackError);
        setError("Unable to create account. Please contact administrator.");
      }
    }
  };

  const handleForgotPassword = async (step: number) => {
    if (step === 1) {
      if (!forgotPasswordEmail) {
        setError("Please enter your email address");
        return;
      }

      // Check if email exists in system
      const allUsers = getAllUsers();
      const userExists = allUsers.find((u) => u.email === forgotPasswordEmail);

      if (!userExists) {
        setError("Email not found in system");
        return;
      }

      // Generate and "send" reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      setResetCode(resetCode);
      setResetStep(2);
      alert(
        `Reset code sent to your email: ${resetCode}\n\nNote: In production, this would be sent via email.`,
      );
    } else if (step === 2) {
      if (!resetCode || resetCode.length !== 6) {
        setError("Please enter the 6-digit reset code");
        return;
      }

      // In a real system, you'd validate the code against what was sent
      setResetStep(3);
      setError("");
    } else if (step === 3) {
      if (!newPassword || newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      // Reset password in system
      const allUsers = getAllUsers();
      const userToUpdate = allUsers.find(
        (u) => u.email === forgotPasswordEmail,
      );

      if (userToUpdate && changeUserPassword) {
        const success = changeUserPassword(userToUpdate.id, newPassword);

        if (success) {
          setShowForgotPassword(false);
          setResetStep(1);
          setForgotPasswordEmail("");
          setResetCode("");
          setNewPassword("");
          alert(
            "Password reset successfully! You can now login with your new password.",
          );
        } else {
          setError("Failed to reset password. Please try again.");
        }
      } else {
        setError("User not found. Please contact administrator.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="w-full max-w-md space-y-8 mt-8">
        {/* Church Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-full shadow-xl border-4 border-red-100">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F0627183da1a04fa4b6c5a1ab36b4780e%2F24ea526264444b8ca043118a01335902?format=webp&width=800"
                alt="TSOAM Logo"
                className="h-24 w-24 object-contain"
              />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "#800020" }}>
              The Seed of Abraham Ministry (TSOAM)
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Church Management System
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">
              Sign in to your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    disabled={attemptingLogin}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    disabled={attemptingLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    disabled={attemptingLogin}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {requireOTP && (
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="pl-10"
                      maxLength={6}
                      disabled={attemptingLogin}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    disabled={attemptingLogin}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Remember me (7 days)
                  </Label>
                </div>

                <Dialog
                  open={showForgotPassword}
                  onOpenChange={setShowForgotPassword}
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-500"
                      disabled={attemptingLogin}
                    >
                      Forgot password?
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Reset Password
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {resetStep === 1 && (
                        <>
                          <p className="text-sm text-gray-600">
                            Enter your email address and we'll send you a reset
                            code.
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="resetEmail">Email Address</Label>
                            <Input
                              id="resetEmail"
                              type="email"
                              value={forgotPasswordEmail}
                              onChange={(e) =>
                                setForgotPasswordEmail(e.target.value)
                              }
                              placeholder="Enter your email"
                            />
                          </div>
                          <Button
                            onClick={() => handleForgotPassword(1)}
                            className="w-full"
                          >
                            Send Reset Code
                          </Button>
                        </>
                      )}

                      {resetStep === 2 && (
                        <>
                          <p className="text-sm text-gray-600">
                            Enter the reset code sent to {forgotPasswordEmail}
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="resetCode">Reset Code</Label>
                            <Input
                              id="resetCode"
                              type="text"
                              value={resetCode}
                              onChange={(e) => setResetCode(e.target.value)}
                              placeholder="Enter reset code"
                            />
                          </div>
                          <Button
                            onClick={() => handleForgotPassword(2)}
                            className="w-full"
                          >
                            Verify Code
                          </Button>
                        </>
                      )}

                      {resetStep === 3 && (
                        <>
                          <p className="text-sm text-gray-600">
                            Enter your new password
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                            />
                          </div>
                          <Button
                            onClick={() => handleForgotPassword(3)}
                            className="w-full"
                          >
                            Reset Password
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-800 hover:bg-red-900"
                disabled={attemptingLogin || isLoading}
              >
                {attemptingLogin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Admin Create Account Button */}
            <div className="mt-4 pt-4 border-t">
              <Dialog
                open={showCreateAccount}
                onOpenChange={setShowCreateAccount}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={attemptingLogin}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create User Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Create New User Account
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleCreateAccount}
                    className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={createAccountForm.fullName}
                          onChange={(e) =>
                            setCreateAccountForm({
                              ...createAccountForm,
                              fullName: e.target.value,
                            })
                          }
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select
                          value={createAccountForm.role}
                          onValueChange={(value) =>
                            setCreateAccountForm({
                              ...createAccountForm,
                              role: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="HR Officer">
                              HR Officer
                            </SelectItem>
                            <SelectItem value="Finance Officer">
                              Finance Officer
                            </SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="createEmail">Email Address *</Label>
                      <Input
                        id="createEmail"
                        type="email"
                        value={createAccountForm.email}
                        onChange={(e) =>
                          setCreateAccountForm({
                            ...createAccountForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={createAccountForm.phone}
                          onChange={(e) =>
                            setCreateAccountForm({
                              ...createAccountForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={createAccountForm.department}
                          onChange={(e) =>
                            setCreateAccountForm({
                              ...createAccountForm,
                              department: e.target.value,
                            })
                          }
                          placeholder="Enter department"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                          id="employeeId"
                          value={createAccountForm.employeeId}
                          onChange={(e) =>
                            setCreateAccountForm({
                              ...createAccountForm,
                              employeeId: e.target.value,
                            })
                          }
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tempPassword">Temporary Password</Label>
                        <Input
                          id="tempPassword"
                          value={createAccountForm.temporaryPassword}
                          onChange={(e) =>
                            setCreateAccountForm({
                              ...createAccountForm,
                              temporaryPassword: e.target.value,
                            })
                          }
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateAccount(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Account</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2025 The Seed of Abraham Ministry. All rights reserved.</p>
          <p className="mt-1">
            For support, contact{" "}
            <a
              href="mailto:admin@tsoam.org"
              className="text-blue-600 hover:text-blue-500"
            >
              admin@tsoam.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
