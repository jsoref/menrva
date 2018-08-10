const admin = require("../admin");
const getCommitDetails = require("./getCommitDetails");

module.exports = async function getBuildsForRepo({ owner, repo }) {
  const query = admin
    .firestore()
    .collection("builds")
    .where("repo", "==", `${owner}/${repo}`)
    .orderBy("started_at", "desc");
  const results = await query.get();

  return await Promise.all(
    results.docs.map(async doc => {
      const travisData = doc.data();
      let githubData = await getCommitDetails(
        travisData.pr_sha || travisData.commit
      );
      return {
        ...travisData,
        ...githubData,
      };
    })
  );
};
