import React from "react";
import { mount } from "enzyme";

import BuildInfo from "./BuildInfo";

describe("BuildInfo", function() {
  it("renders", async function() {
    const build = {
      job: "414643450",
      commit: "a2fa1e94cd1472d082cc2c24c1955e244c8d70e6",
      branch: "ref/db-calls",
      pr_branch: "",
      pr_slug: "",
      token: "1234",
      fileName: "index-renders",
      status: "passed",
      repo: "billyvg/menrva",
      files: [
        {
          testName: "Index renders",
          link:
            "https://storage.googleapis.com/sercy-2de63.appspot.com/upload_6f79a8734dcada08e038ec996474572c.png",
        },
        {
          testName: "BuildInfo renders",
          link:
            "https://storage.googleapis.com/sercy-2de63.appspot.com/upload_c9db22715981ea92204558101309bf39.png",
        },
      ],
      pr_sha: "",
      last_updated_at: 1533926467753,
      pr: "",
      build: "414643449",
      started_at: 1533926356249,
      head_commit: {
        author: { email: "billy@sentry.io", name: "Billy Vong" },
        message: "compare images + update build status in db",
        id: "a2fa1e94cd1472d082cc2c24c1955e244c8d70e6",
        timestamp: "2018-08-10T18:37:19Z",
        committer: { email: "billy@sentry.io", name: "Billy Vong" },
        tree_id: "2e5fe3e2b5be8d698514883fb312078a6d999f84",
      },
      before: "a9842c3e006a41144518028bd78b3a7e394db2b2",
      parent: {
        pr_slug: "",
        token: "1234",
        fileName: "build-info-renders",
        status: "passed",
        repo: "billyvg/menrva",
        files: [
          {
            testName: "BuildInfo renders",
            link:
              "https://storage.googleapis.com/sercy-2de63.appspot.com/upload_8d9bcc27d9028c74043cce1bd7f82867.png",
          },
          {
            testName: "Index renders",
            link:
              "https://storage.googleapis.com/sercy-2de63.appspot.com/upload_cd73462c5b621bb096bee80d51f064d8.png",
          },
        ],
        pr_sha: "",
        last_updated_at: 1533925229721,
        pr: "",
        build: "414627663",
        started_at: 1533923676006,
        job: "414627664",
        commit: "a9842c3e006a41144518028bd78b3a7e394db2b2",
        branch: "ref/db-calls",
        pr_branch: "",
      },
    };
    let wrapper = mount(<BuildInfo {...build} />);
    await expect(wrapper).toSnapshot();
  });
});
