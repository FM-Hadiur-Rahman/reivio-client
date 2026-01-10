import React from "react";

const ContactUsPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Contact Us</h1>
      <p className="text-gray-700 mb-4">
        Have a question or feedback? We'd love to hear from you.
      </p>

      <div className="bg-white shadow p-6 rounded border border-gray-200">
        <form className="space-y-4">
          <div>
            <label className="block font-medium text-sm mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Message</label>
            <textarea
              rows="5"
              className="w-full border rounded px-3 py-2"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
          >
            Send Message
          </button>
        </form>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <p>📧 Email: help@banglabnb.com</p>
        <p>📱 WhatsApp: +880-1XXX-XXXXXX</p>
        <p>🕐 Support Hours: 9 AM – 8 PM (BDT)</p>
      </div>
    </div>
  );
};

export default ContactUsPage;
