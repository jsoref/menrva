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
import Pending from "../components/svg/Pending";
import Failed from "../components/svg/Pending";
import Approved from "../components/svg/Pending";
import Images from "../components/svg/Images";
import BreadCrumbs from "../components/Breadcrumbs";

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

    if (!build) return <LoadingSpinner />;
    return <Build build={build} />;
  }
}

class Build extends Component {
  static propTypes = {
    build: propTypes.object,
  };

  render() {
    let { build } = this.props;
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
          <BuildStatus status={status}>
            {(status == "passed" || status == "approved") && <Approved />}
            {status == "pending" && <Pending />}
            {status == "failed" && <Failed />}
          </BuildStatus>
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
          <ApproveButton status={status}>
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

let getColor = status => {
  if (status == "pending") return theme.yellow;
  if (status == "passed") return theme.green;
  if (status == "failed") return theme.red;
  return theme.gray8;
};

let BuildHeader = styled("div")`
  background: ${theme.gray3};
  padding: 2em;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center
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

let BuildStatus = styled("div")`
  background: ${theme.gray9};
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3.5em;
  width: 3.5em;
  border-radius: 3.5em;
  color: ${p => getColor(p.status)};
  margin-right: 0.66em;
`;

let ApproveButton = styled("div")`
  background-color: ${theme.green};
  font-size: 1rem;
  padding: 0 4em;
  height: 3em;
  cursor: pointer;
  border-radius: 2em;
  box-shadow: ${p => (p.status == "approved") ? "rgba(0, 0, 0, 0.05) 4px 4px 2px 2px inset" : "rgba(0,0,0,0.05) 1px 1px 5px 1px"};
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
