// src/pages/RegisterStep2.jsx
import { useSearchParams } from "react-router-dom";
import SignupFormStep2 from "../components/SignupFormStep2";

const RegisterStep2 = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  if (!userId) return <p className="text-center">Missing user ID.</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <SignupFormStep2 userId={userId} />
    </div>
  );
};

export default RegisterStep2;
