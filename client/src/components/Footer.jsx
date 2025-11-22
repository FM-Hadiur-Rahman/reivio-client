import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold mb-2">Reivio</h2>
          <p className="text-sm text-gray-200">{t("footer.description")}</p>
          <div className="mt-3 text-xs bg-green-800 px-3 py-1 inline-block rounded-full font-semibold">
            🔒 {t("footer.verified_badge")}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{t("footer.explore")}</h3>
          <ul className="space-y-1 text-sm text-gray-100">
            <li>
              <Link to="/listings">{t("footer.find_stay")}</Link>
            </li>
            <li>
              <Link to="/register">{t("footer.become_host")}</Link>
            </li>
            <li>
              <Link to="/help">{t("footer.help_center")}</Link>
            </li>
            <li>
              <Link to="/contact">{t("footer.contact_us")}</Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{t("footer.legal")}</h3>
          <ul className="space-y-1 text-sm text-gray-100">
            <li>
              <Link to="/terms">{t("footer.terms")}</Link>
            </li>
            <li>
              <Link to="/privacy">{t("footer.privacy")}</Link>
            </li>
            <li>
              <Link to="/refund-policy">{t("footer.refund")}</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{t("footer.support")}</h3>
          <p className="text-sm">📧 help@reivio.com</p>
          <p className="text-sm">📱 WhatsApp: +880-1763558585</p>
          <Link to="/emergency" className="hover:text-red-600 font-semibold">
            🚨 {t("footer.emergency")}
          </Link>

          <div className="mt-3">
            <label htmlFor="lang" className="text-sm font-medium">
              🌍 {t("footer.language")}
            </label>
            <select
              id="lang"
              className="ml-2 text-black text-sm px-2 py-1 rounded"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>

          <div className="flex gap-2 mt-4">
            <img src="/reivio.png" alt="Google Play" className="h-10" />
            <img src="/reivio.png" alt="App Store" className="h-10" />
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-200 mt-8 border-t border-green-600 pt-4">
        &copy; {new Date().getFullYear()} Reivio. {t("footer.rights")}
      </div>
    </footer>
  );
};

export default Footer;
