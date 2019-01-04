const updateBuild = require("./updateBuild");
const getTravisBuild = require("./getTravisBuild");
const endGithubCheck = require("./endGithubCheck");

module.exports = async function approveBuild({ owner, repo, build, startedAt }) {
  await updateBuild(build, {
    status: "approved",
    startedAt: startedAt,
  });
  const travis = getTravisBuild({
    owner,
    repo,
    build,
  });
  endGithubCheck(travis.check_run_id, `${owner}/${repo}`, true, startedAt);
};
