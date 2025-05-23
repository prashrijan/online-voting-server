import { DateTime } from "luxon";

export const combineDateTime = (date, time, timezone = "UTC") => {
    if (!date || !time) return new Date("Invalid");

    const dateOnly =
        typeof date === "string"
            ? date.split("T")[0]
            : date instanceof Date
            ? date.toISOString().split("T")[0]
            : null;

    if (!dateOnly) return new Date("Invalid");

    // Extract time and meridiem
    const [timePart, meridiem] = time.trim().toUpperCase().split(" ");
    let [hour, minute] = timePart.split(":").map(Number);

    // Convert to 24-hour time
    if (meridiem === "PM" && hour < 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    // Create luxon DateTime in user's timezone
    const localDateTime = DateTime.fromObject(
        {
            year: Number(dateOnly.split("-")[0]),
            month: Number(dateOnly.split("-")[1]),
            day: Number(dateOnly.split("-")[2]),
            hour,
            minute,
        },
        { zone: timezone }
    );

    // Return JavaScript Date in UTC
    return localDateTime.toUTC().toJSDate();
};
