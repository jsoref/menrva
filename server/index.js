const path = require("path");

const Koa = require("koa");
const next = require("next");
const bodyParser = require("koa-body");
const Router = require("koa-router");
const cookie = require("koa-cookie").default;
const uuidv4 = require("uuid/v4");

const admin = require("./admin");
const githubHooksHandler = require("./hooks/github");

const bucket = admin.storage().bucket();

const app = next({
  dir: path.resolve(__dirname, "../"),
  dev: process.env.NODE_ENV === "development",
});
const defaultHandler = app.getRequestHandler();

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();

  server.proxy = true;
  server.use(
    bodyParser({
      multipart: true,
    })
  );

  router.use(cookie());

  // Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
  // The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
  // `Authorization: Bearer <Firebase ID Token>`.
  // when decoded successfully, the ID Token content will be added as `req.user`.
  router.use(async (ctx, next) => {
    const { req, request, cookie } = ctx;

    if (!request.path.startsWith("/api/")) {
      await next();
      return;
    }

    // console.log("cookies", cookie);
    if (
      (!req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")) &&
      !(cookie && cookie.__session)
    ) {
      console.error(
        "No Firebase ID token was passed as a Bearer token in the Authorization header.",
        "Make sure you authorize your request by providing the following HTTP header:",
        "Authorization: Bearer <Firebase ID Token>",
        'or by passing a "session" cookie.'
      );
      ctx.status = 403;
      return;
    }

    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else if (cookie && cookie.__session) {
      console.log('Found "session" cookie', cookie.__session);
      // Read the ID Token from cookie.
      idToken = cookie.__session;
    } else {
      // No cookie
      ctx.status = 403;
      return;
    }

    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      ctx.user = decodedIdToken;
      await next();
    } catch (error) {
      console.error("Error while verifying Firebase ID token", error);
      ctx.status = 403;
    }
  });

  // Create token for user
  router.post("/api/token", async ctx => {
    const { user } = ctx;

    if (!user) {
      ctx.res.statusCode = 403;
      return;
    }

    const docRef = admin.firestore().doc(`/users/${user.user_id}`);
    const token = uuidv4();
    await docRef.set({
      writeToken: token,
    });
    ctx.res.statusCode = 200;
    ctx.body = {
      token,
    };

    console.log("created token", token, user.name);
  });

  router.get("/api/token", async ctx => {
    const { user } = ctx;

    const tokensDoc = admin.firestore().doc(`/users/${user.user_id}`);
    const token = await tokensDoc.get();
    ctx.body = {
      token: (token.exists && token.data().writeToken) || null,
    };
  });

  // API endpoint to list an array of unique repo names
  router.get("/api/repos", async ctx => {
    const buildsRef = admin.firestore().collection("builds");
    const snapshot = await buildsRef.get();
    const repoArray = snapshot.docs.map(doc => doc.data().repo);
    ctx.body = [...new Set(repoArray)];
  });

  router.post("/api/user", async ctx => {
    const { request, user } = ctx;
    const { body } = request;
    console.log("create user", user);
    if (!user) {
      ctx.status = 403;
      return;
    }

    admin
      .firestore()
      .doc(`/users/${user.user_id}`)
      .set({
        user_id: user.user_id,
        githubToken: body.githubToken,
        providerId: body.userInfo.providerId,
        username: body.userInfo.username,
        profile: body.userInfo.profile,
      });
  });

  // API endpoint to get a list of builds
  // take a router param repo
  // list from collection builds that match repo passed as param
  router.get("/api/builds/:owner/:repo", async ctx => {
    const { params } = ctx;
    const travisRef = admin
      .firestore()
      .collection("builds")
      .where("repo", "==", `${params.owner}/${params.repo}`)
      .orderBy("started_at", "desc");
    const snapshot = await travisRef.get();

    ctx.body = await Promise.all(
      snapshot.docs.map(async doc => {
        const travisData = doc.data();
        const githubRef = await admin
          .firestore()
          .collection("github-jobs")
          .where(
            "check_suite.head_sha",
            "==",
            travisData.pr_sha || travisData.commit
          )
          .get();
        const githubDoc = githubRef.size && githubRef.docs[0].data();

        let githubData = {};
        let { check_suite } = githubDoc || {};
        if (check_suite) {
          let { head_commit } = check_suite;
          githubData = {
            head_commit,
          };
        }
        return {
          ...travisData,
          ...githubData,
        };
      })
    );
  });

  // API endpoint to get a list of builds
  // take a router param repo
  // list from collection builds the repo
  router.get("/api/build/:owner/:repo/:build", async ctx => {
    const { params } = ctx;
    const travisRef = await admin
      .firestore()
      .collection("builds")
      .where("repo", "==", `${params.owner}/${params.repo}`)
      .where("build", "==", params.build);
    const travisDoc = await travisRef.get();
    const travisData = travisDoc.size && travisDoc.docs[0].data();
    const githubRef = await admin
      .firestore()
      .collection("github-jobs")
      .where(
        "check_suite.head_sha",
        "==",
        travisData.pr_sha || travisData.commit
      )
      .get();
    const githubDoc = githubRef.size && githubRef.docs[0].data();

    let githubData = {};
    let { sender, check_suite } = githubDoc || {};
    let parentDoc = {};
    if (check_suite) {
      let { head_commit, before } = check_suite;
      githubData = {
        head_commit,
        sender,
      };

      const parentRef = await admin
        .firestore()
        .collection("builds")
        .where("commit", "==", before)
        .get();
      parentDoc = (parentRef.size && parentRef.docs[0].data()) || {};
    }

    ctx.body = {
      ...travisData,
      ...githubData,
      parent: parentDoc,
    };
  });

  router.post("/build/upload", async ctx => {
    const { request } = ctx;
    const { files, body, query } = request;
    const { token } = query;
    const { testName, ...restBody } = body;

    // TODO check if token is valid
    const allFiles = await Promise.all(
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
    console.log(allFiles);
    const uploadedFiles = allFiles.map(([{ name }]) => ({
      link: `https://storage.googleapis.com/sercy-2de63.appspot.com/${name}`,
      testName,
    }));

    const firestore = admin.firestore();
    const buildRef = firestore.doc(`/builds/${body.job}`);
    const doc = await buildRef.get();

    if (!doc.data()) {
      await buildRef.set({
        ...restBody,
        status: "pending",
        token,
        files: uploadedFiles,
        started_at: new Date().getTime(),
      });
    } else {
      await firestore.runTransaction(async t => {
        const doc = await t.get(buildRef);
        const data = doc.data() || {};
        t.update(buildRef, {
          files: [
            ...(data.files || []),
            ...allFiles.map(([{ name }]) => ({
              link: `https://storage.googleapis.com/sercy-2de63.appspot.com/${name}`,
              testName,
            })),
          ],
          last_updated_at: new Date().getTime(),
        });
      });
    }

    ctx.body = {};
    ctx.respond = true;
  });

  router.post("/build/upload-finish", async ctx => {
    console.log("upload finished");
    // kick off image processing for build
    ctx.respond = true;
  });

  router.post("/github/hooks", async ctx => {
    await githubHooksHandler(ctx);
    // ctx.body = {};
    ctx.respond = true;
  });

  // debugging
  router.post("/github/*", async ctx => {
    const { request } = ctx;
    const { body, path } = request;
    console.log("github route hit", path, body);

    ctx.res.statusCode = 500;
    // ctx.body = {};
    ctx.respond = true;
  });

  router.get("/github/setup", async ctx => {
    const { req, request, res } = ctx;
    const { query } = request;
    console.log("github setup", query);

    if (query.setup_action === "install") {
      // install github
      // save user + installation_id
    }

    await defaultHandler(req, res);
    ctx.respond = false;
  });

  router.get("*", async ctx => {
    const { req, res } = ctx;
    let { path } = ctx.request;
    const length = path.length;

    if (path[length - 1] === "/") {
      path = path.substr(0, length - 1);
    }

    await defaultHandler(req, res);
    ctx.respond = false;
  });

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await next();
  });

  server.use(router.routes());

  server.listen(3000, err => {
    if (err) {
      throw err;
    }
    console.log(`> Ready`);
  });
});
