import axios from "axios";
import firebase from "firebase";

import initFirebase from "../util/initFirebase";

async function getHeaders(idToken) {
  initFirebase();
  idToken = idToken || (await firebase.auth().currentUser?.getIdToken());
  console.log("get headers", idToken);
  return {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  };
}

const api = {
  post: async (url, data, options = {}) => {
    const resp = await axios.post(url, data, {
      ...(await getHeaders(options.token)),
      ...options,
    });
    return resp.data;
  },
  get: async (url, options = {}) => {
    const resp = await axios.get(url, {
      ...(await getHeaders()),
      ...options,
    });
    return resp.data;
  },
};

export default api;

if (typeof window != "undefined") {
  window.api = api;
}
