const VerifyNotice = () => {
  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        📧 Verify Your Email
      </h2>
      <p className="text-gray-700">
        We’ve sent a verification link to your email address.
        <br />
        Please check your inbox and click the link to activate your account.
      </p>
    </div>
  );
};

export default VerifyNotice;
