import axios from "axios";
import firebase from "firebase";

async function getHeaders(idToken) {
  idToken = idToken || (await firebase.auth().currentUser?.getIdToken());
  return {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  };
}

const api = {
  post: async (url, data, options = {}) =>
    axios.post(url, data, { ...(await getHeaders(options.token)), ...options }),
  get: async (url, options = {}) =>
    axios.get(url, { ...(await getHeaders()), ...options }),
};

export default api;
if (window) {
    window.api = api;
}
