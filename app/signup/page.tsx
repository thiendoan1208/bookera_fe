"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Logo from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import routes from "@/routes/routes";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

function SignUpPage() {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});

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
        ...formData,
        username,
      };
      console.log("Sign Up Form Data:", submitData);
    }
  };

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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
              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
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
            <Button type="submit" className="w-full" size="lg">
              Create account
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
