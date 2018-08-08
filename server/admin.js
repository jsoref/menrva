const admin = require("firebase-admin");

const credential = admin.credential.cert({
  projectId: "sercy-2de63",
  clientEmail: "sercy-server-app@sercy-2de63.iam.gserviceaccount.com",
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
});
if (!admin.apps.length) {
  admin.initializeApp({
    credential,
    storageBucket: "sercy-2de63.appspot.com",
  });
}

module.exports = admin;
