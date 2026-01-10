import React from "react";

const RefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">💸 Refund Policy</h1>
      <p className="mb-4">
        Our refund policy ensures fairness for both guests and hosts. Read below
        to understand the conditions.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Full refund if canceled 48 hours before check-in.</li>
        <li>50% refund if canceled within 24–48 hours of check-in.</li>
        <li>No refund if canceled within 24 hours of check-in.</li>
      </ul>

      <hr className="my-6" />

      <h1 className="text-2xl font-bold mt-10">💸 রিফান্ড নীতিমালা</h1>
      <ul className="list-disc pl-6 space-y-2 mt-4">
        <li>চেক-ইনের ৪৮ ঘণ্টা আগে বাতিল করলে সম্পূর্ণ রিফান্ড।</li>
        <li>২৪–৪৮ ঘণ্টার মধ্যে বাতিল করলে ৫০% রিফান্ড।</li>
        <li>চেক-ইনের ২৪ ঘণ্টার মধ্যে বাতিল করলে কোন রিফান্ড নেই।</li>
      </ul>
    </div>
  );
};

export default RefundPolicy;
