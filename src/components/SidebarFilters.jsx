const availableFilters = ["AC", "Sea View", "Wifi", "Family Friendly"];

const SidebarFilters = ({ selectedFilters, onChange }) => {
  const toggleFilter = (filter) => {
    const updated = selectedFilters.includes(filter)
      ? selectedFilters.filter((f) => f !== filter)
      : [...selectedFilters, filter];

    onChange(updated);
  };

  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">Filters</h3>
      <div className="space-y-2 text-sm">
        {availableFilters.map((filter) => (
          <label key={filter} className="block">
            <input
              type="checkbox"
              className="mr-2"
              checked={selectedFilters.includes(filter)}
              onChange={() => toggleFilter(filter)}
            />
            {filter}
          </label>
        ))}
      </div>
    </div>
  );
};

export default SidebarFilters;
