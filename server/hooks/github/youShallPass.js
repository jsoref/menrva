// const admin = require("./admin");

module.exports = async function youShallPass() {
  const axios = require("axios");
  const jwt = require("jsonwebtoken");
  const fs = require("fs");

  // const firestore = admin.firestore();

  const now = Math.floor(Date.now() / 1000);

  // supply path to pem file
  const cert = fs.readFileSync("/Users/billy/Dev/menrva.pem");

  // create token
  // sign token
  const token = jwt.sign(
    {
      // issued at time
      iat: now,
      //   set expiration at maximum 10 minutes
      exp: now + 600,
      // Github App identifier
      iss: 15743,
    },
    cert,
    {
      algorithm: "RS256",
    }
  );

  // db call for installation id
  // const installationId = firestore.doc(`/github-installations`); the right way
  const installationId = 281903; //replace with the right way in the future

  // POST pass token to get installation access token
  const { data } = await axios.post(
    `https://api.github.com/installations/${installationId}/access_tokens`,
    {},
    {
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github.machine-man-preview+json",
      },
    }
  );

  console.log("installation access token", data.token);

  return data.token;
};
