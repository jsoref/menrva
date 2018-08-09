const admin = require("../../admin");
const runMenrvaCheck = require("../../runMenrvaCheck");

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
      const { repositories } = docRef.get().data();
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
    case "requested": {
      await firestore.doc(`/github-jobs/${payload.check_suite.id}`).set({
        ...payload,
        status: "pending",
      });
      const result = await runMenrvaCheck(payload.check_suite);
      break;
    }

    default:
      return;
  }
};
