const admin = require("../admin");

module.exports = async function getTravisBuild({ owner, repo, build, commit }) {
  let query = await admin
    .firestore()
    .collection("builds")
    .where("repo", "==", `${owner}/${repo}`);

  if (build) {
    query = query.where("build", "==", build);
  } else if (commit) {
    query = query.where("commit", "==", commit);
  }

  const result = await query.get();

  // just return first result for now
  return result.size && result.docs[0].data();
};
