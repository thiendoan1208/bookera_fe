"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import Logo from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import routes from "@/routes/routes";
import { signUp } from "@/service/auth_service";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

function SignUpPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(routes.home);
    }
  }, [user, loading, router]);

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      toast.success("Account created successfully!");
      router.push(routes.login);
    },
    onError: () => {
      toast.error("Sign up failed. Please try again.");
    },
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 15 && formData.password.length < 8) {
      newErrors.password =
        "Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const username = `${formData.firstName} ${formData.lastName}`;
      const submitData = {
        username,
        email: formData.email,
        password: formData.password,
      };

      // Call the signup mutation
      signUpMutation.mutate(submitData);
    }
  };

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleGoogleSignUp = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      signUpMutation.mutate({ credential: credentialResponse.credential });
    } else {
      toast.error("Google sign up failed - no credential received");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-110">
        {/* Logo and sign in link */}
        <div className="flex justify-between items-center mb-8">
          <Logo />
          <div className="text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link href={routes.login} className="text-blue-600 hover:underline">
              Sign in →
            </Link>
          </div>
        </div>

        {/* Sign up form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-light mb-6">Sign up for Bookera</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OAuth buttons */}
            <div className="space-y-3 mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSignUp}
                onError={() => {
                  toast.error("Google sign up failed");
                }}
              />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium mb-2"
              >
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                aria-invalid={!!errors.firstName}
                placeholder="First Name"
                className="w-full"
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium mb-2"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                aria-invalid={!!errors.lastName}
                placeholder="Last Name"
                className="w-full"
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                aria-invalid={!!errors.email}
                placeholder="Email"
                className="w-full"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                aria-invalid={!!errors.password}
                placeholder="Password"
                className="w-full"
                autoComplete="new-password"
              />
              {errors.password ? (
                <p className="text-xs text-destructive mt-1">
                  {errors.password}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Password should be at least 15 characters OR at least 8
                  characters including a number and a lowercase letter.
                </p>
              )}
            </div>

            {/* Create account button */}
            <Button
              type="submit"
              className="w-full cursor-pointer"
              size="lg"
              disabled={signUpMutation.isPending}
            >
              {signUpMutation.isPending
                ? "Creating account..."
                : "Create account"}
            </Button>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              By creating an account, you agree to the{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>
              . For more information about Bookera&apos;s privacy practices, see
              the{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                Privacy Statement
              </Link>
              . We&apos;ll occasionally send you account-related emails.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
