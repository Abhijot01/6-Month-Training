import axios from "axios";

export const insertComponent = async (payload) => {

  const response = await axios.post(

    "http://localhost:5000/api/manual-entry",

    payload
  );

  return response.data;
};