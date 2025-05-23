import { DateTime } from "luxon";

export const combineDateTime = (date, time, timezone = "UTC") => {
    if (!date || !time) return;

    const dateStr =
        date instanceof Date
            ? date.toISOString().split("T")[0]
            : date.split("T")[0];

    const [timePart, meridiem] = time.trim().toUpperCase().split(" ");
    if (!timePart || !meridiem) return;

    let [hours, minutes] = timePart.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    const dt = DateTime.fromISO(dateStr, { zone: timezone }).set({
        hour: hours,
        minute: minutes,
        second: 0,
    });

    return dt.toJSDate();
};
