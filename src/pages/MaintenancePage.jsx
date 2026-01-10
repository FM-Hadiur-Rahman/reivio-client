// pages/MaintenancePage.jsx
const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
      <h1 className="text-4xl font-bold text-red-600 mb-4">
        🚧 Maintenance Mode
      </h1>
      <p className="text-lg text-gray-700">
        BanglaBnB is currently undergoing maintenance.
        <br />
        Please check back shortly.
      </p>
    </div>
  );
};

export default MaintenancePage;
