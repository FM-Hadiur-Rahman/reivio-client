// utils/getTimeLeft.js
import dayjs from "dayjs";

const getTimeLeft = (date, time) => {
  const now = dayjs();
  const tripTime = dayjs(`${date} ${time}`);
  const diffInMinutes = tripTime.diff(now, "minute");

  if (diffInMinutes <= 0) return "Departed";

  const days = Math.floor(diffInMinutes / 1440);
  const hours = Math.floor((diffInMinutes % 1440) / 60);
  const minutes = diffInMinutes % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

export default getTimeLeft;
