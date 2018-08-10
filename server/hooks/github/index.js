const admin = require("../../admin");
const startGithubCheck = require("../../api/startGithubCheck");
const updateBuild = require("../../api/updateBuild");
const getTravisBuild = require("../../api/getTravisBuild");

module.exports = async function githubHooksHandler(ctx) {
  const { request } = ctx;
  const { body } = request;
  const { action, ...payload } = body;

  const firestore = admin.firestore();

  switch (action) {
    // github app created
    case "created":
      await firestore
        .doc(`/github-installations/${payload.installation.id}`)
        .set(payload);
      break;
    // github app deleted/uninstalled
    case "deleted": {
      // TODO remove document?
      break;
    }
    // Repository was added
    case "added": {
      const docRef = await firestore.doc(
        `/github-installations/${payload.installation.id}`
      );
      const { repositories } = (await docRef.get()).data();
      const removed = payload.repositories_removed.map(({ id }) => id);
      await docRef.set({
        respositories: [
          ...repositories.filter(({ id }) => removed.includes(id)),
          ...payload.repositories_added,
        ],
      });
      break;
    }

    // when repo has been pushed to?
    case "rerequested":
    case "requested": {
      await firestore.doc(`/github-jobs/${payload.check_suite.id}`).set({
        ...payload,
        status: "pending",
      });
      const [owner, repo] = payload.repository.full_name;

      // TODO figure out auth
      const checkResponse = await startGithubCheck(
        payload.repository.full_name,
        payload.check_suite
      );

      const travis = getTravisBuild({
        owner,
        repo,
        commit: payload.check_suite.head_commit.head_sha,
      });

      updateBuild(travis.job, {
        check_run_id: checkResponse.id,
      });

      break;
    }

    default:
      return;
  }
};
