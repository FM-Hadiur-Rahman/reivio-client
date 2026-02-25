import { Link } from "react-router-dom";

const PromoBanner = () => (
  <div className="bg-green-50 border border-green-300 rounded-md p-3 text-sm text-green-800">
    🎁 Refer a friend & earn ৳200!
    <Link
      to="/my-referrals"
      className="block text-green-600 font-medium mt-2 underline"
    >
      View Referral Program
    </Link>
  </div>
);
export default PromoBanner;
