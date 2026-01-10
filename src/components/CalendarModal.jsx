import React from "react";
import { Dialog } from "@headlessui/react";
import { DateRange } from "react-date-range";
import { enUS } from "date-fns/locale";
import { bn } from "date-fns/locale";

const CalendarModal = ({
  isOpen,
  onClose,
  range,
  setRange,
  isDateBooked,
  isBn = false,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded shadow-lg p-4">
          <Dialog.Title className="text-lg font-semibold mb-2">
            📅 Select Your Dates
          </Dialog.Title>
          <DateRange
            ranges={range}
            onChange={(item) => setRange([item.selection])}
            minDate={new Date()}
            rangeColors={["#f43f5e"]}
            disabledDay={isDateBooked}
            editableDateInputs={true}
            months={1}
            direction="vertical"
            locale={isBn ? bn : enUS}
          />
          <button
            onClick={onClose}
            className="mt-4 w-full bg-red-500 text-white py-2 rounded"
          >
            Done
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CalendarModal;
