import { v4 as uuidv4 } from "uuid";

export const generateChunaabCode = () => {
    const id = uuidv4();

    return id.split("-")[0];
};
