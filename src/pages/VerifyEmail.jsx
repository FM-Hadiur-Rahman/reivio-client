import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();
  // const role = localStorage.getItem("signupRole");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("❌ No token provided.");
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-email?token=${token}`
      )
      .then((res) => {
        const { userId, role } = res.data;
        if (!userId) {
          setMessage("❌ Email verified but user ID missing.");
          return;
        }

        setMessage("✅ Email verified! Redirecting to Step 2...");
        localStorage.setItem("signupUserId", userId);

        setTimeout(() => {
          console.log("userId:", userId, "role:", role);

          navigate(`/register/step2?userId=${userId}&role=${role}`);
        }, 3000);
      })
      .catch(() => {
        setMessage(
          <>
            ❌ Invalid or expired token.{" "}
            <button
              className="text-blue-600 underline"
              onClick={() => navigate("/resend-verification")}
            >
              Resend Verification Email
            </button>
          </>
        );
      });
  }, [searchParams, navigate]);

  return (
    <div className="text-center mt-10 text-lg font-semibold">{message}</div>
  );
};

export default VerifyEmail;
