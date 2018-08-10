const getCommitDetails = require("./getCommitDetails");
const getTravisBuild = require("./getTravisBuild");

module.exports = async function getBuildDetails({
  owner,
  repo,
  build,
  commit,
  withParent,
}) {
  const travisData = await getTravisBuild({ owner, repo, build, commit });
  const githubData = await getCommitDetails(
    travisData?.pr_sha || travisData?.commit
  );
  const parent =
    (withParent &&
      (await getTravisBuild({ owner, repo, commit: githubData.before }))) ||
    {};

  return {
    ...travisData,
    ...githubData,
    parent,
  };
};
