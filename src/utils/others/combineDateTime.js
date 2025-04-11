/**
 * Combines a date string and a time string into a single JavaScript Date object.
 *
 * @param {string} date - The date string in the format "YYYY-MM-DD".
 * @param {string} time - The time string in the format "hh:mm AM/PM".
 * @returns {Date} A JavaScript Date object representing the combined date and time.
 *
 * @example
 * // Returns a Date object for "2024-10-10T14:30:00.000Z"
 * combineDateTime("2024-10-10", "2:30 PM");
 *
 * @throws {TypeError} Throws an error if the input strings are not in the expected format.
 */
const combineDateTime = (date, time) => {
    if (!date || !time) return;
    const [timeStr, meredim] = time.trim().toUpperCase().split(" ");
    let [hour, minute] = timeStr.split(":");

    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);

    if (meredim === "PM" && hour <= 12) {
        hour += 12;
    }

    if (meredim === "AM" && hour === 12) {
        hour = 0;
    }

    const combined = new Date(date);
    combined.setHours(hour, minute, 0, 0);
    return combined;
};
