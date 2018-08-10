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
  };

  render() {
    let { status, count } = this.props;

    return (
      <Container status={status}>
        {(status == "passed" || status == "approved") && <Approved />}
        {status == "pending" && <Pending />}
        {status == "failed" && <Failed />}
        {count && <Count status={count}>{count}</Count>}
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
  height: 3.5em;
  width: 3.5em;
  border-radius: 3.5em;
  color: ${p => getColor(p.status)};
  margin-right: 0.66em;
`;

let Count = styled("div")`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(-100%, -100%);
  background-color: ${p => getColor(p.status)};
`;
