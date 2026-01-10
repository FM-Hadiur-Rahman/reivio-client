// // src/context/AuthContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   // ⏳ State
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });

//   const [token, setToken] = useState(() => localStorage.getItem("token"));
//   const [loading, setLoading] = useState(true);

//   // ✅ Universal user setter (after login, register, or switch role)
//   const updateUser = (newUser) => {
//     setUser(newUser);
//     localStorage.setItem("user", JSON.stringify(newUser));
//   };

//   // ✅ Universal token setter
//   const updateToken = (newToken) => {
//     setToken(newToken);
//     localStorage.setItem("token", newToken);
//   };

//   // ✅ Logout (safe and reactive)
//   const logout = (message = null) => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser(null);
//     setToken(null);
//     if (message) toast.error(message);
//     window.location.href = "/login"; // or use navigate if preferred
//   };

//   // ✅ Check session on initial load or token change
//   const checkSession = async () => {
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/api/auth/me`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       updateUser(res.data.user);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         logout("🚫 Session expired or account deleted.");
//       } else {
//         toast.error("⚠️ Failed to validate session.");
//         console.error("Session check error:", err);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     checkSession();
//   }, [token]);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         updateUser,
//         updateToken,
//         logout,
//         loading,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ✅ Export custom hook
// export const useAuth = () => useContext(AuthContext);

// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api"; // must add auth header (see below)

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(true);

  const updateUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };
  const updateToken = (t) => {
    setToken(t);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const logout = (message = null) => {
    updateToken(null);
    updateUser(null);
    if (message) toast.error(message);
    window.location.href = "/login";
  };

  const fetchMe = async (tkn = token) => {
    const res = await api.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    // Normalize nested flags to avoid undefined in UI
    const u = res.data?.user || null;
    if (u) {
      u.phoneVerified = !!u.phoneVerified;
      u.identityVerified = !!u.identityVerified || u.kyc?.status === "approved";
      u.paymentDetails = { verified: !!u.paymentDetails?.verified };
    }
    updateUser(u);
    return u;
  };

  const checkSession = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      await fetchMe(token);
      console.debug("🔐 session ok");
    } catch (err) {
      console.debug(
        "❌ /auth/me failed",
        err?.response?.status,
        err?.response?.data
      );
      if (err?.response?.status === 401) {
        logout("🚫 Session expired or invalid.");
      } else {
        toast.error("⚠️ Failed to validate session.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Call on mount and whenever token changes
  useEffect(() => {
    checkSession();
  }, [token]);

  // Login helper (use this in your LoginForm)
  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { token: tkn, user: initialUser } = res.data || {};
    updateToken(tkn);
    // Save initial (for immediate UI), then fetch fresh snapshot
    if (initialUser) updateUser(initialUser);
    await fetchMe(tkn);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, updateUser, updateToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
