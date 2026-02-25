// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { toast } from "react-toastify";
// import { logError } from "../utils/logError";
// import { useAuth } from "../context/AuthContext";
// import axios from "axios";
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   Loader2,
//   LogIn,
//   ShieldCheck,
//   Sparkles,
// } from "lucide-react";

// const LoginForm = () => {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPass, setShowPass] = useState(false);
//   const [remember, setRemember] = useState(true);
//   const [shake, setShake] = useState(false);

//   const navigate = useNavigate();
//   const { updateUser, updateToken } = useAuth();

//   const saved = useMemo(() => {
//     try {
//       return {
//         token: localStorage.getItem("token"),
//         user: JSON.parse(localStorage.getItem("user")),
//       };
//     } catch {
//       return { token: null, user: null };
//     }
//   }, []);

//   const goByRole = (role) => {
//     navigate(
//       role === "admin"
//         ? "/admin/dashboard"
//         : role === "host"
//           ? "/host/dashboard"
//           : role === "driver"
//             ? "/dashboard/driver"
//             : "/dashboard",
//       { replace: true },
//     );
//   };

//   const handleChange = (e) => {
//     setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
//   };

//   const triggerShake = () => {
//     setShake(true);
//     window.setTimeout(() => setShake(false), 500);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (isLoading) return;

//     setIsLoading(true);

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/auth/login`,
//         formData,
//         { headers: { "Content-Type": "application/json" } },
//       );

//       const user = res.data.user;

//       if (!user?.isVerified) {
//         toast.warn("⚠️ Please verify your email before logging in.");
//         triggerShake();
//         return;
//       }

//       const updatedUser = {
//         ...user,
//         token: res.data.token,
//         role: user.primaryRole, // legacy
//         primaryRole: user.primaryRole,
//         roles: Array.isArray(user.roles) ? user.roles : ["user"],
//       };

//       // ✅ save to storage (remember me)
//       if (remember) {
//         localStorage.setItem("token", res.data.token);
//         localStorage.setItem("user", JSON.stringify(updatedUser));
//       } else {
//         // session-only behavior
//         sessionStorage.setItem("token", res.data.token);
//         sessionStorage.setItem("user", JSON.stringify(updatedUser));
//         // also clear persistent storage
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//       }

//       updateToken(res.data.token);
//       updateUser(updatedUser);

//       toast.success("✅ Logged in successfully!");
//       setFormData({ email: "", password: "" });

//       goByRole(updatedUser.primaryRole);
//     } catch (err) {
//       console.error(err);
//       toast.error(
//         err?.response?.data?.message || "❌ Login failed. Check credentials.",
//       );
//       triggerShake();
//       logError(err, "LoginForm.submit", formData.email);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ Auto redirect if already logged in (prevent flicker)
//   useEffect(() => {
//     // support localStorage OR sessionStorage
//     const token =
//       localStorage.getItem("token") || sessionStorage.getItem("token");
//     const userStr =
//       localStorage.getItem("user") || sessionStorage.getItem("user");

//     let user = null;
//     try {
//       user = userStr ? JSON.parse(userStr) : null;
//     } catch {}

//     if (token && user?.isVerified) {
//       const role = user.primaryRole || user.role || "user";
//       goByRole(role);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="min-h-[100vh] flex items-center justify-center px-4 py-10 bg-[radial-gradient(80%_80%_at_50%_10%,rgba(20,184,166,0.18),transparent_60%),radial-gradient(70%_70%_at_20%_80%,rgba(59,130,246,0.10),transparent_60%),linear-gradient(to_bottom,rgba(240,253,250,1),rgba(255,255,255,1))]">
//       <div className="w-full max-w-md">
//         {/* Brand header */}
//         <div className="mb-6 text-center">
//           <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white/80 border border-teal-100 shadow-sm flex items-center justify-center backdrop-blur">
//             <Sparkles className="w-6 h-6 text-teal-700" />
//           </div>
//           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
//             Welcome back
//           </h1>
//           <p className="mt-2 text-sm text-slate-600">
//             Log in to manage stays, rides, and bookings on Reivio.
//           </p>
//         </div>

//         {/* Card */}
//         <div
//           className={[
//             "relative rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_20px_70px_rgba(2,6,23,0.10)] overflow-hidden",
//             shake ? "animate-[shake_.5s_ease-in-out]" : "",
//           ].join(" ")}
//         >
//           {/* top accent line */}
//           <div className="h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />

//           {/* subtle inner glow */}
//           <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-teal-200/30 blur-3xl" />
//           <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl" />

//           <div className="p-6 sm:p-7 relative">
//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
//                 <LogIn className="w-6 h-6 text-teal-700" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-extrabold text-slate-900">Login</h2>
//                 <p className="text-sm text-slate-500">
//                   Secure access to your dashboard
//                 </p>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Email */}
//               <div>
//                 <label className="text-xs font-bold text-slate-700">
//                   Email address
//                 </label>
//                 <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 transition focus-within:ring-4 focus-within:ring-teal-100 focus-within:border-teal-300">
//                   <Mail className="w-5 h-5 text-slate-400" />
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="you@example.com"
//                     className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     autoComplete="email"
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="text-xs font-bold text-slate-700">
//                   Password
//                 </label>
//                 <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 transition focus-within:ring-4 focus-within:ring-teal-100 focus-within:border-teal-300">
//                   <Lock className="w-5 h-5 text-slate-400" />
//                   <input
//                     type={showPass ? "text" : "password"}
//                     name="password"
//                     placeholder="••••••••"
//                     className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                     autoComplete="current-password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPass((p) => !p)}
//                     className="p-1.5 rounded-xl hover:bg-slate-100 transition"
//                     aria-label={showPass ? "Hide password" : "Show password"}
//                   >
//                     {showPass ? (
//                       <EyeOff className="w-5 h-5 text-slate-500" />
//                     ) : (
//                       <Eye className="w-5 h-5 text-slate-500" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Row: remember + forgot */}
//               <div className="flex items-center justify-between">
//                 <label className="inline-flex items-center gap-2 text-xs text-slate-600 select-none">
//                   <input
//                     type="checkbox"
//                     className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200"
//                     checked={remember}
//                     onChange={(e) => setRemember(e.target.checked)}
//                   />
//                   Remember me
//                 </label>

//                 <Link
//                   to="/forgot-password"
//                   className="text-xs font-bold text-teal-700 hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-extrabold py-3 hover:from-teal-700 hover:to-cyan-700 transition shadow-[0_14px_30px_rgba(13,148,136,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Logging in...
//                   </>
//                 ) : (
//                   <>
//                     <LogIn className="w-5 h-5" />
//                     Login
//                   </>
//                 )}
//               </button>

//               {/* Divider */}
//               <div className="flex items-center gap-3 py-1">
//                 <div className="h-px flex-1 bg-slate-200" />
//                 <span className="text-[11px] font-semibold text-slate-500">
//                   or
//                 </span>
//                 <div className="h-px flex-1 bg-slate-200" />
//               </div>

//               {/* Register */}
//               <Link
//                 to="/register"
//                 className="w-full inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/70 py-3 text-sm font-extrabold text-slate-800 hover:bg-white transition"
//               >
//                 Create account
//               </Link>
//             </form>

//             {/* Trust note */}
//             <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 flex items-start gap-3">
//               <div className="mt-0.5">
//                 <ShieldCheck className="w-4 h-4 text-teal-700" />
//               </div>
//               <div>
//                 <div className="font-bold text-slate-800">
//                   Reivio Trust & Safety
//                 </div>
//                 <div className="mt-1">
//                   We protect accounts with email verification, secure sessions,
//                   and identity checks for hosts & drivers.
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* shake keyframes */}
//           <style>{`
//             @keyframes shake {
//               0%, 100% { transform: translateX(0); }
//               20% { transform: translateX(-6px); }
//               40% { transform: translateX(6px); }
//               60% { transform: translateX(-4px); }
//               80% { transform: translateX(4px); }
//             }
//           `}</style>
//         </div>

//         <p className="mt-6 text-center text-xs text-slate-500">
//           By continuing you agree to Reivio’s policies and verification process.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { logError } from "../utils/logError";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();
  const { updateUser, updateToken } = useAuth();

  const goByRole = (role) => {
    navigate(
      role === "admin"
        ? "/admin/dashboard"
        : role === "host"
          ? "/host/dashboard"
          : role === "driver"
            ? "/dashboard/driver"
            : "/dashboard",
      { replace: true },
    );
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData,
        { headers: { "Content-Type": "application/json" } },
      );

      const user = res.data.user;

      if (!user?.isVerified) {
        toast.warn("⚠️ Please verify your email before logging in.");
        triggerShake();
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

      // ✅ save to storage (remember me)
      if (remember) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      updateToken(res.data.token);
      updateUser(updatedUser);

      toast.success("✅ Logged in successfully!");
      setFormData({ email: "", password: "" });

      goByRole(updatedUser.primaryRole);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "❌ Login failed. Check credentials.",
      );
      triggerShake();
      logError(err, "LoginForm.submit", formData.email);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Auto redirect if already logged in (prevent flicker)
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const userStr =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch {}

    if (token && user?.isVerified) {
      const role = user.primaryRole || user.role || "user";
      goByRole(role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-[100vh] flex items-center justify-center px-4 py-10 bg-[radial-gradient(80%_80%_at_50%_10%,rgba(20,184,166,0.18),transparent_60%),radial-gradient(70%_70%_at_20%_80%,rgba(59,130,246,0.10),transparent_60%),linear-gradient(to_bottom,rgba(240,253,250,1),rgba(255,255,255,1))] overflow-hidden">
      {/* Subtle animated blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-teal-200/25 blur-3xl animate-[floaty_9s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl animate-[floaty_11s_ease-in-out_infinite]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Brand header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white/80 border border-teal-100 shadow-sm flex items-center justify-center backdrop-blur">
            <Sparkles className="w-6 h-6 text-teal-700" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Log in to manage stays, rides, and bookings on Reivio.
          </p>
        </div>

        {/* Card */}
        <div
          className={[
            "relative rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_20px_70px_rgba(2,6,23,0.10)] overflow-hidden",
            shake ? "animate-[shake_.5s_ease-in-out]" : "",
          ].join(" ")}
        >
          {/* top accent line */}
          <div className="h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />

          {/* subtle inner glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-teal-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl" />

          <div className="p-6 sm:p-7 relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Login</h2>
                <p className="text-sm text-slate-500">
                  Secure access to your dashboard
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Email address
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 transition focus-within:ring-4 focus-within:ring-teal-100 focus-within:border-teal-300">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 transition focus-within:ring-4 focus-within:ring-teal-100 focus-within:border-teal-300">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 transition"
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

              {/* Row: remember + forgot */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-extrabold py-3 hover:from-teal-700 hover:to-cyan-700 transition shadow-[0_14px_30px_rgba(13,148,136,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
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

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-semibold text-slate-500">
                  or
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Google placeholder */}
              <button
                type="button"
                onClick={() => toast.info("Google login coming soon ✅")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 py-3 text-sm font-extrabold text-slate-800 hover:bg-white transition"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
                Continue with Google
              </button>

              {/* Register */}
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/70 py-3 text-sm font-extrabold text-slate-800 hover:bg-white transition"
              >
                Create account
              </Link>
            </form>

            {/* Trust note */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 flex items-start gap-3">
              <div className="mt-0.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <div className="font-bold text-slate-800">
                  Reivio Trust & Safety
                </div>
                <div className="mt-1">
                  We protect accounts with email verification, secure sessions,
                  and identity checks for hosts & drivers.
                </div>
              </div>
            </div>
          </div>

          {/* animations */}
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              20% { transform: translateX(-6px); }
              40% { transform: translateX(6px); }
              60% { transform: translateX(-4px); }
              80% { transform: translateX(4px); }
            }
            @keyframes floaty {
              0%, 100% { transform: translate(0,0) scale(1); }
              50% { transform: translate(10px,-12px) scale(1.03); }
            }
          `}</style>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing you agree to Reivio’s policies and verification process.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
