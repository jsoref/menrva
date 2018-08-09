import React, { Component } from "react";
import styled from "react-emotion";
import propTypes from "prop-types";
import { withRouter } from "next/router";

import LoadingSpinner from "../components/LoadingSpinner";
import { fadeIn } from "../styles/keyframes";
import Diff from "../components/Diff";
import BuildInfo from "../components/BuildInfo";
import theme from "../styles/theme";
import api from "../util/api";

class BuildContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      build: null,
    };
  }
  async componentDidMount() {
    const { router } = this.props;
    const build = await api.get(
      `/api/build/${router.query.repo}/${router.query.build}`
    );

    this.setState({ build });
  }

  render() {
    let { build } = this.state;

    if (!build) return <StyledLoadingSpinner />;
    return <Build build={build} />;
  }
}

class Build extends Component {
  static propTypes = {
    build: propTypes.object,
  };

  render() {
    let { build } = this.props;
    let { parent, files } = build;
    let { files: parentFiles } = parent || {};

    let filesMap =
      files && new Map(files.map(({ testName, link }) => [testName, link]));
    let parentFilesMap = new Map(
      (parentFiles &&
        parentFiles.map(({ testName, link }) => [testName, link])) ||
        []
    );

    return (
      <div>
        <StyledBuildInfo {...build} showApproveButton={true} />
        {Array.from(filesMap).map(([testName, link]) => (
          <div key={testName}>
            <BuildTitle>{testName}</BuildTitle>
            <Diff src1={link} src2={parentFilesMap.get(testName)} />
          </div>
        ))}
      </div>
    );
  }
}

export default withRouter(BuildContainer);
export { Build };

let StyledBuildInfo = styled(BuildInfo)`
  padding-right: 5em;
`;

let BuildTitle = styled("div")`
  font-size: 1.1em;
  text-decoration: none;
  padding: 1em 3em 1.2em 3em;
  background-color: #fff;
  border-bottom: 1px solid ${theme.gray3};
`;

let StyledLoadingSpinner = styled(LoadingSpinner)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  opacity: 0;
  animation: 2s forwards ${fadeIn};
`;
