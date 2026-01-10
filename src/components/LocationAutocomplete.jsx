import React, { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import { fetchSuggestions } from "../utils/mapboxUtils";

const LocationAutocomplete = ({
  placeholder,
  onSelect,
  value = "",
  onClear = () => {},
  onChange = () => {},
}) => {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      const results = await fetchSuggestions(query);
      setSuggestions(results);
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    onChange(e);
    if (val.length > 2) debouncedSearch(val);
    else setSuggestions([]);
  };

  const handleSelect = (place) => {
    setSuggestions([]);
    setInput(place.place_name);
    onSelect({
      name: place.place_name,
      coordinates: place.center,
    });
  };

  const handleClear = () => {
    setInput("");
    setSuggestions([]);
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="border px-4 py-2 pr-10 rounded w-full"
      />

      {input && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
        >
          ✖
        </button>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(s)}
            >
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
