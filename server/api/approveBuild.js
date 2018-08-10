const updateBuild = require("./updateBuild");
const getTravisBuild = require("./getTravisBuild");
const endGithubCheck = require("./endGithubCheck");

module.exports = async function approveBuild({ owner, repo, build }) {
  await updateBuild(build, {
    status: "approved",
  });
  const travis = getTravisBuild({
    owner,
    repo,
    build,
  });
  endGithubCheck(travis.check_run_id, `${owner}/${repo}`, true);
};
