import axios from "axios";

export const api = axios.create({
  // No baseURL - use relative URLs (works on any domain)
  headers: {
    "Content-Type": "application/json",
  },
});
