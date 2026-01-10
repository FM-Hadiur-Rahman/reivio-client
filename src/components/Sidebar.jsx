import SidebarFilters from "./SidebarFilters";
import FeaturedStays from "./FeaturedStays";
import PromoBanner from "./PromoBanner";

const Sidebar = ({ selectedFilters, onFilterChange }) => {
  return (
    <aside className="hidden lg:block sticky top-28 h-fit bg-white border rounded-xl p-4 space-y-6">
      <SidebarFilters
        selectedFilters={selectedFilters}
        onChange={onFilterChange}
      />
      <FeaturedStays />
      <PromoBanner />
    </aside>
  );
};

export default Sidebar;
