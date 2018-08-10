import React from "react";
import { mount } from "enzyme";

import { Build } from "./build";
import mock from "../mock-response";

describe("Build", function() {
  it("renders", async function() {
    const data = mock.builds.find(b => b.id === 134);
    let wrapper = mount(<Build build={data} />);
    await expect(wrapper).toSnapshot();
  });
});
