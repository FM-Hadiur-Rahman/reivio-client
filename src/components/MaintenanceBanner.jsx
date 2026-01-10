// components/MaintenanceBanner.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const MaintenanceBanner = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/config`)
      .then((res) => setIsMaintenance(res.data.maintenanceMode))
      .catch(() => setIsMaintenance(false));
  }, []);

  if (!isMaintenance) return null;

  return (
    <div className="bg-yellow-300 text-center py-3 text-lg font-medium text-black z-50">
      🚧 BanglaBnB is currently under maintenance. Please check back later.
    </div>
  );
};

export default MaintenanceBanner;
