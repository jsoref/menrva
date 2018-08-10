import React from "react";
import propTypes from "prop-types";
import styled from "react-emotion";
import theme from "../styles/theme";
import Pending from "../components/svg/Pending";
import Failed from "../components/svg/Failed";
import Approved from "../components/svg/Approved";

export default class BuildStatus extends React.Component {
  static propTypes = {
    status: propTypes.string.isRequired,
    count: propTypes.number,
    size: propTypes.string,
  };

  render() {
    let { status, count, size } = this.props;

    return (
      <Container status={status} size={size}>
        {(status == "passed" || status == "approved") && <Approved />}
        {status == "pending" && <Pending />}
        {status == "failed" && <Failed />}
        {count && !(status == "passed" || status == "approved") && <Count status={status}>{count}</Count>}
      </Container>
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
  background: ${theme.gray9};
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${p => (p.size == "small" ? "2.75em" : "3.5em")};
  width: ${p => (p.size == "small" ? "2.75em" : "3.5em")};
  border-radius: 3.5em;
  color: ${p => getColor(p.status)};
  margin-right: 0.66em;
  position: relative;
`;

let Count = styled("div")`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(35%, -40%);
  background: ${p => getColor(p.status)};
  color: ${p => (p.status == "pending") ? theme.gray7 : "#fff" };
  border-radius: 2em;
  width: 1.5em;
  height: 1.5em;
  font-size: 0.7em;
  display: flex;
  align-items: center;
  justify-content: center;
`;
