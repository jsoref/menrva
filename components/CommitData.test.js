import React from "react";
import { mount } from "enzyme";

import CommitData from "./CommitData";

describe("CommitData", function() {
  it("renders", async function() {
    let wrapper = mount(
      <CommitData
        message="fix(ui): Fix padding"
        commit={{ author: { email: "billy@sentry.io" } }}
      />
    );
    await expect(wrapper).toSnapshot();
  });
});
