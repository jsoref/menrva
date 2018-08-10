import React, { Component } from "react";
import styled from "react-emotion";
import propTypes from "prop-types";
import Link from "next/link";
import theme from "../styles/theme";
import ChevronRight from "./svg/ChevronRight";
import Avatar from "./Avatar";
import CommitData from "./CommitData";

class BuildInfo extends Component {
  static propTypes = {
    id: propTypes.number,
    commit: propTypes.string, //expound on this later
    snapshots: propTypes.array,
    status: propTypes.string,
    interactive: propTypes.bool,
    showMeta: propTypes.bool,
    showApproveButton: propTypes.bool,
    branch: propTypes.string,
    build: propTypes.string,
  };

  render() {
    let {
      branch,
      build,
      commit,
      head_commit,
      sender,
      job,
      repo,
      repo_slug,
      status,
      files,
      pr,
      pr_branch,
      pr_sha,
      pr_slug,
      started_at,
      showMeta,
      showApproveButton,
    } = this.props;

    return (
      <Link href={{ pathname: "/build", query: { repo, build } }}>
        <Container {...this.props}>
          <SnapshotCount status={status}>{files?.length}</SnapshotCount>
          <div>
            <PullRequestTitle>
              {pr_branch || branch || "Unknown Build"}
            </PullRequestTitle>
            <div style={{ display: "flex", alignItems: "center" }}>
              <BuildNumber>#{build}</BuildNumber>
              {head_commit && (
                <CommitData commit={head_commit} repo={repo} pr={pr} />
              )}
            </div>
          </div>
          <StyledChevron />
        </Container>
      </Link>
    );
  }
}

let getColor = status => {
  if (status == "pending") return theme.yellow;
  if (status == "passed") return theme.green;
  if (status == "failed") return theme.red;
  return theme.gray8;
};

let Container = styled("div")`
  color: ${theme.gray7};
  text-decoration: none;
  padding: 2em 2em 2em;
  align-items: center;
  border-bottom: 1px solid ${theme.gray3};
  display: grid;
  grid-template-columns: 25px auto 10px;
  grid-column-gap: 3em;
  user-select: none;
  transition: 0.2s background;

  &:hover {
    background: ${theme.gray2};
    cursor: pointer;
  }
`;

let SnapshotCount = styled("div")`
  width: 3em;
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => getColor(p.status)};
  color: ${(p => p.status == "pending") ? "inherit" : "#fff"};
  border-radius: 3em;
  font-weight: bold;
`;

let PullRequestTitle = styled("h1")`
  font-size: 20px;
  width: 100%;
  margin-bottom: 0.33em;
`;

let BuildNumber = styled("span")`
  font-weight: bold;
  font-size: 0.9em;
  margin-right: 0.25em;
`;

let StyledChevron = styled(ChevronRight)`
  height: 1.5em;
  path {
    stroke: ${theme.gray4};
  }
`;

export default BuildInfo;
