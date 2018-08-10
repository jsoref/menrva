const admin = require("../admin");

// Updates build details
module.exports = async function updateBuild(id, details) {
  const firestore = admin.firestore();
  const buildRef = firestore.doc(`/builds/${id}`);
  const doc = await buildRef.get();

  const filteredDetails = Object.entries(details)
    .filter(([, value]) => typeof value !== "undefined")
    .map(([key, value]) => [key, value])
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  if (!doc.data()) {
    await buildRef.set({
      status: "pending",
      ...filteredDetails,
      started_at: new Date().getTime(),
    });
  } else {
    // Only allow files and status to be updated after the build has been created
    const { files, status } = details;
    await firestore.runTransaction(async t => {
      const doc = await t.get(buildRef);
      const data = doc.data() || {};
      t.update(buildRef, {
        files: [...(data.files || []), ...(files || [])],
        status: status || data.status,
        last_updated_at: new Date().getTime(),
      });
    });
  }
};
