/* global expect */

// eslint-disable-next-line
import path from "path";

import slugify from "@sindresorhus/slugify";
import menrva from "menrva-client/travis";

expect.extend({
  async toSnapshot(received, argument) {
    try {
      const cloned = document.documentElement.cloneNode(true);
      const body = cloned.getElementsByTagName("body").item(0);
      body.innerHTML = received.html();
      // eslint-disable-next-line
      const page = global.page;
      await page.setContent(cloned.outerHTML);
      // eslint-disable-next-line
      const fs = require("fs");
      // const css = fs
      // .readFileSync(
      // path.resolve(__dirname, '../../src/sentry/static/sentry/dist/sentry.css'),
      // 'utf8'
      // )
      // .replace(/[\r\n]+/g, '');
      // page.addStyleTag({
      // content: css,
      // });
      const testName = this.currentTestName;
      const slug = slugify(testName);
      const filePath = `./.artifacts/${slug}.png`;
      await page.screenshot({
        path: filePath,
        fullPage: true,
      });

      if (!process.env.MENRVA_TOKEN) {
        return {
          message: () => "expected to save snapshot",
          pass: true,
        };
      }
      console.log("uploading ", testName, slug);
      menrva.upload({
        files: [
          {
            name: slug,
            path: filePath,
          },
        ],
        job: process.env.TRAVIS_JOB_ID,
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
    return {
      message: () => "expected to save snapshot",
      pass: true,
    };
  },
});
