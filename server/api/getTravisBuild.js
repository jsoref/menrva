const admin = require("../admin");

module.exports = async function getTravisBuild({
  owner,
  repo,
  build,
  commit,
  branch,
  latest,
}) {
  let query = await admin
    .firestore()
    .collection("builds")
    .where("repo", "==", `${owner}/${repo}`);

  if (build) {
    query = query.where("build", "==", build);
  } else if (commit) {
    query = query.where("commit", "==", commit);
  } else if (branch) {
    query = query.where("branch", "==", branch);
  }

  if (latest) {
    query = query.orderBy("started_at", "desc");
  }

  const result = await query.get();

  // just return first result for now
  return result.size && result.docs[0].data();
};
