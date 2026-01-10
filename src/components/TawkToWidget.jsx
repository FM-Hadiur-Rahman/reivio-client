import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TawkToWidget = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // 1. ⛔ Hide chat for logged-out users
    if (!user) return;

    // 2. ⛔ Disable widget on admin routes
    const excludedPaths = ["/admin"];
    const isExcluded = excludedPaths.some((path) =>
      location.pathname.startsWith(path)
    );
    if (isExcluded) return;

    // 4. Inject script
    const s1 = document.createElement("script");
    s1.src = "https://embed.tawk.to/686933b9be8a1b1910b84326/1ivdf43q7";
    s1.async = true;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    s1.onload = () => {
      if (window.Tawk_API) {
        // 👤 Set user info
        window.Tawk_API.setAttributes(
          {
            name: user.name,
            email: user.email,
            role: user.role,
          },
          (err) => err && console.warn("Tawk setAttributes error:", err)
        );

        // 🚀 Open for host, or delay open for guest
        if (user.role === "host") {
          window.Tawk_API.maximize();
        } else {
          setTimeout(() => window.Tawk_API.maximize(), 8000); // 8 sec
        }

        // 🔽 Minimize after 20 sec
        setTimeout(() => {
          if (window.Tawk_API.popupStatus() === "maximized") {
            window.Tawk_API.minimize();
          }
        }, 20000);
      }
    };

    document.body.appendChild(s1);
  }, [location.pathname]);

  return null;
};

export default TawkToWidget;
