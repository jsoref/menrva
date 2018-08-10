import React, { Component } from "react";
import styled from "react-emotion";
import propTypes from "prop-types";
import Link from "next/link";
import theme from "../styles/theme";
import ChevronRight from "./svg/ChevronRight";
import Commit from "./svg/Commit";
import Avatar from "./Avatar";

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

  time(time) {
    return new Date(time).toLocaleTimeString("en-US", {
      hour12: false,
    });
  }

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

    const url = `https://github.com/${repo}/pull/${pr}`;

    return (
      <Link href={{ pathname: "/build", query: { repo, build } }}>
        <Container {...this.props}>
          <SnapshotCount status={status}>{files.length}</SnapshotCount>
          <div>
            <PullRequestTitle>
              {pr_branch || branch || "Unknown Build"}
            </PullRequestTitle>
            <div style={{ display: "flex", alignItems: "center" }}>
              <BuildNumber>#{build}</BuildNumber>
              {head_commit && (
                <Link href={url}>
                  <CommitData>
                    {head_commit?.message}
                    <StyledAvatar
                      email={head_commit?.author?.email}
                      size="small"
                    />
                    <StyledCommit />
                  </CommitData>
                </Link>
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
  padding: 2em 2.5em 2em;
  align-items: center;
  border-bottom: 1px solid ${theme.gray3};
  display: grid;
  grid-template-columns: 40px auto 10px;
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

let CommitData = styled("div")`
  display: flex;
  align-items: center;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  font-size: 0.7em;
  background: ${theme.gray3};
`;

let StyledChevron = styled(ChevronRight)`
  height: 1.5em;
  path {
    stroke: ${theme.gray4};
  }
`;

let StyledAvatar = styled(Avatar)`
  width: 1.25em;
  height: 1.25em;
  margin-left: 0.25em;
  border-radius: 10px;
`;

let StyledCommit = styled(Commit)`
  height: 0.6em;
  color: ${theme.gray8};
  margin-left: 0.25em;
`;

export default BuildInfo;
