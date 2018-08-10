import React, { Component } from "react";
import styled from "react-emotion";
import propTypes from "prop-types";
import { withRouter } from "next/router";
import Link from "next/link";

import LoadingSpinner from "../components/LoadingSpinner";
import Diff from "../components/Diff";
import CommitData from "../components/CommitData";
import theme from "../styles/theme";
import api from "../util/api";
import Images from "../components/svg/Images";
import BreadCrumbs from "../components/Breadcrumbs";
import BuildStatus from "../components/BuildStatus";

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

  handleApprove = async () => {
    const { router } = this.props;
    await api.post(
      `/api/build/${router.query.repo}/${router.query.build}/approve`
    );
    this.setState(state => ({
      build: {
        ...state.build,
        status: "approved",
      },
    }));
  };
  render() {
    let { build } = this.state;

    if (!build) return <LoadingSpinner />;
    return <Build build={build} onApprove={this.handleApprove} />;
  }
}

class Build extends Component {
  static propTypes = {
    onApprove: propTypes.func,
    build: propTypes.object,
  };

  render() {
    let { build, onApprove } = this.props;
    let {
      parent,
      files,
      head_commit,
      branch,
      pr,
      pr_branch,
      status,
      repo,
    } = build;
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
        <BreadCrumbs>
          <Link href="/">
            <a>Home</a>
          </Link>{" "}
          /
          <Link href="/">
            <a>{repo}</a>
          </Link>{" "}
          /
          <Link href="/">
            <a>{build.build}</a>
          </Link>{" "}
          /
        </BreadCrumbs>
        <BuildHeader>
          <BuildStatus status={status} />
          <div>
            <PullRequestTitle>
              {pr_branch || branch || "Unknown Build"}
            </PullRequestTitle>
            <div style={{ display: "flex", alignItems: "center" }}>
              <BuildNumber>#{build.build}</BuildNumber>
              {head_commit && (
                <CommitData commit={head_commit} repo={repo} pr={pr} />
              )}
            </div>
          </div>
          <ApproveButton status={status} onClick={onApprove}>
            {status == "approved" ? "Approved" : "Approve"}
          </ApproveButton>
        </BuildHeader>
        {Array.from(filesMap).map(([testName, link]) => (
          <div key={testName}>
            <SnapshotTitle>
              <StyledDiff />
              {testName}
            </SnapshotTitle>
            <Diff src1={parentFilesMap.get(testName)} src2={link} />
          </div>
        ))}
      </div>
    );
  }
}

export default withRouter(BuildContainer);
export { Build };

let BuildHeader = styled("div")`
  background: ${theme.gray3};
  padding: 2em;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
`;

let PullRequestTitle = styled("div")`
  font-size: 1.8em;
  width: 100%;
  margin-bottom: 0.25em;
  font-weight: 500;
`;

let BuildNumber = styled("span")`
  font-weight: bold;
  font-size: 0.9em;
  margin-right: 0.5em;
`;

let ApproveButton = styled("div")`
  background-color: ${theme.green};
  font-size: 1rem;
  padding: 0 4em;
  height: 3em;
  cursor: pointer;
  border-radius: 2em;
  box-shadow: ${p =>
    p.status == "approved"
      ? "rgba(0, 0, 0, 0.05) 4px 4px 2px 2px inset"
      : "rgba(0,0,0,0.05) 1px 1px 5px 1px"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: 0.2s transform;

  &:hover {
    transform: scale(1.05);
  }
`;

let SnapshotTitle = styled("div")`
  background: rgba(0, 0, 0, 0.05);
  padding: 0.75em 0.5em;
  display: inline-flex;
  margin: 2em 1em 0 3em;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
`;

let StyledDiff = styled(Images)`
  height: 1.3em;
  width: 1.5em;
  margin-right: 0.25em;
  color: ${theme.gray8};
`;
