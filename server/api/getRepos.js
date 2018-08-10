const admin = require("../admin");

module.exports = async function getRepos() {
  const result = await admin
    .firestore()
    .collection("builds")
    .get();
  return [...new Set(result.docs.map(doc => doc.data().repo).filter(d => !!d))];
};
