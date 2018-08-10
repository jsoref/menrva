const admin = require("../admin");

// Updates build details
module.exports = async function uploadFiles(files, testName) {
  const bucket = admin.storage().bucket();
  // TODO check if token is valid
  const uploadedFiles = await Promise.all(
    (Array.isArray(files.file) ? files.file : [files.file]).map(file => {
      const fileParts = file.path.split("/");
      return bucket.upload(file.path, {
        destination: `${fileParts[fileParts.length - 1]}.png`,
        metadata: {
          contentType: "image/png",
        },
        public: true,
      });
    })
  );
  console.log(uploadedFiles);
  return uploadedFiles.map(([{ name }, { bucket }]) => ({
    link: `https://storage.googleapis.com/${bucket}/${name}`,
    testName,
  }));
};
