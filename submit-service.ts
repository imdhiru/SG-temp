import { v4 as uuid } from "uuid";

export const submitService = {
  get generateUUID() {
    return uuid();
  },
};

export default submitService;
