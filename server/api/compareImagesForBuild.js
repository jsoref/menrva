const axios = require("axios");
const { PNG } = require("pngjs");
const getDiffSnapshotsForBuild = require("./getDiffSnapshotsForBuild");

module.exports = async function compareImagesForBuild({ owner, repo, build }) {
  const getImage = src =>
    axios({ method: "get", url: src, responseType: "stream" }).then(
      res =>
        new Promise(resolve => {
          res.data.pipe(new PNG()).on("parsed", image => {
            return resolve(image);
          });
        })
    );

  const compareImages = (src1, src2) =>
    new Promise(resolve => {
      if (!src2) return resolve(true);
      Promise.all([getImage(src1), getImage(src2)]).then(response => {
        let [image1, image2] = response;
        return resolve(image1.equals(image2));
      });
    });

  const tests = await getDiffSnapshotsForBuild({ owner, repo, build });
  const compareResults = tests.map(({ snapshots }) => {
    return compareImages(...snapshots);
  });

  const results = await Promise.all(compareResults);

  // Return true if test passes, e.g. images are all the same
  return !results.find(result => result === false);
};
