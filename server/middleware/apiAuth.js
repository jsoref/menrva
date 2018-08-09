const admin = require("../admin");

module.exports = function apiAuth() {
  return async (ctx, next) => {
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
  };
};
