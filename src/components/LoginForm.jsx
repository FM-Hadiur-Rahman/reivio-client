import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { logError } from "../utils/logError";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from "lucide-react";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const { updateUser, updateToken } = useAuth();

  const saved = useMemo(() => {
    try {
      return {
        token: localStorage.getItem("token"),
        user: JSON.parse(localStorage.getItem("user")),
      };
    } catch {
      return { token: null, user: null };
    }
  }, []);

  const goByRole = (role) => {
    navigate(
      role === "admin"
        ? "/admin/dashboard"
        : role === "host"
        ? "/host/dashboard"
        : role === "driver"
        ? "/dashboard/driver"
        : "/dashboard",
      { replace: true }
    );
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      const user = res.data.user;

      if (!user?.isVerified) {
        toast.warn("⚠️ Please verify your email before logging in.");
        return;
      }

      // ✅ store primaryRole and roles[] (plus legacy role)
      const updatedUser = {
        ...user,
        token: res.data.token,
        role: user.primaryRole, // legacy compatibility
        primaryRole: user.primaryRole,
        roles: Array.isArray(user.roles) ? user.roles : ["user"],
      };

      updateToken(res.data.token);
      updateUser(updatedUser);

      toast.success("✅ Logged in successfully!");
      setFormData({ email: "", password: "" });

      goByRole(updatedUser.primaryRole);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "❌ Login failed. Check credentials."
      );
      logError(err, "LoginForm.submit", formData.email);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Auto redirect if already logged in (prevent flicker)
  useEffect(() => {
    if (saved.token && saved.user?.isVerified) {
      const role = saved.user.primaryRole || saved.user.role || "user";
      goByRole(role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-b from-teal-50 via-white to-slate-50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500" />

        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Login</h2>
              <p className="text-sm text-slate-500">
                Welcome back — access your dashboard
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-bold text-slate-700">Email</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-teal-200">
                <Mail className="w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full outline-none text-slate-900 placeholder:text-slate-400"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-bold text-slate-700">
                Password
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-teal-200">
                <Lock className="w-5 h-5 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full outline-none text-slate-900 placeholder:text-slate-400"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="p-1 rounded-xl hover:bg-slate-100 transition"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <EyeOff className="w-5 h-5 text-slate-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 text-white font-extrabold py-2.5 hover:bg-teal-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-teal-700 font-bold hover:underline"
            >
              Forgot password?
            </Link>

            <Link to="/register" className="text-slate-600 hover:underline">
              Create account
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            By continuing, you agree to our platform policies and security
            checks.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
