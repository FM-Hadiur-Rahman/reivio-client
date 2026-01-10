// src/pages/RegisterPage.jsx
import React, { useEffect, useState } from "react";
import SignupFormStep1 from "../components/SignupFormStep1";
import SignupFormStep2 from "../components/SignupFormStep2";

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null); // save user ID after step 1
  useEffect(() => {
    const savedId = localStorage.getItem("signupUserId");
    if (savedId) {
      setUserId(savedId);
      setStep(2); // skip directly to Step 2
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {step === 1 && (
        <SignupFormStep1
          onSuccess={(createdUserId) => {
            setUserId(createdUserId);
            setStep(2);
          }}
        />
      )}
      {step === 2 && userId && <SignupFormStep2 userId={userId} />}
    </div>
  );
};

export default RegisterPage;
