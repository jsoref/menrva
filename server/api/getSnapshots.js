// Returns a map of testName => [image1, image2]
module.exports = function getSnapshots(
  { files: parentFiles },
  { files: headFiles }
) {
  let filesMap = new Map(
    (headFiles && headFiles.map(({ testName, link }) => [testName, link])) || []
  );
  let parentFilesMap = new Map(
    (parentFiles &&
      parentFiles.map(({ testName, link }) => [testName, link])) ||
      []
  );

  const allTestNames = new Set([
    ...(headFiles || []).map(({ testName }) => testName),
    ...parentFiles.map(({ testName }) => testName),
  ]);

  return Array.from(allTestNames).map(testName => ({
    testName,
    snapshots: [parentFilesMap.get(testName), filesMap.get(testName)],
  }));
};
