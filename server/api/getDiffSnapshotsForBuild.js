const getBuildDetails = require("./getBuildDetails");
const getSnapshots = require("./getSnapshots");

// For each test snapshot in target build, find corresponding test snapshot in parent commit
// @return [testName, link][]
module.exports = async function getDiffSnapshotsForBuild({
  owner,
  repo,
  build,
  commit,
  buildDetails,
}) {
  const headBuild =
    buildDetails ||
    (await getBuildDetails({
      owner,
      repo,
      build,
      commit,
      withParent: true,
    }));
  return getSnapshots(headBuild, headBuild.parent);
};
