const admin = require("../admin");

// Attempts to retrieve information about a commit from github collection
module.exports = async function getCommitDetails(sha) {
  const result = await admin
    .firestore()
    .collection("github-jobs")
    .where("check_suite.head_sha", "==", sha)
    .get();

  // for now always return first doc
  const doc = result.size && result.docs[0].data();
  return {
    head_commit: (doc && doc.check_suite && doc.check_suite.head_commit) || {},
    before: doc && doc.check_suite && doc.check_suite.before,
  };
};
