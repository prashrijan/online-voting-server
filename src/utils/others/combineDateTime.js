export const combineDateTime = (date, time) => {
    if (!date || !time) return;

    let dateOnly;

    // Case 1: If it's a Date object
    if (date instanceof Date) {
        dateOnly = date.toISOString().split("T")[0];
    }
    // Case 2: If it's a string
    else if (typeof date === "string") {
        dateOnly = date.includes("T") ? date.split("T")[0] : date;
    } else {
        return new Date("Invalid");
    }

    // Normalize time input
    const [timePart, meridiem] = time.trim().toUpperCase().split(" ");
    if (!timePart || !meridiem) return new Date("Invalid");

    let [hours, minutes] = timePart.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return new Date("Invalid");

    // Convert to 24-hour time
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    const isoString = `${dateOnly}T${String(hours).padStart(2, "0")}:${String(
        minutes
    ).padStart(2, "0")}:00`;

    const result = new Date(isoString);
    return isNaN(result.getTime()) ? new Date("Invalid") : result;
};
