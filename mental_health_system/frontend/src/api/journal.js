import client from "./client";

export const getEntries = () => client.get("/journal/entries/");
export const createEntry = (data) => client.post("/journal/entries/", data);
export const getEntry = (id) => client.get(`/journal/entries/${id}/`);
export const updateEntry = (id, data) => client.put(`/journal/entries/${id}/`, data);
export const deleteEntry = (id) => client.delete(`/journal/entries/${id}/`);
