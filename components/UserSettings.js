import React from "react";
import api from "../util/api";

export default class UserSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = { token: null };
  }

  async componentDidMount() {
    const resp = await api.get("/api/token");
    this.setState({ token: resp?.data?.token });
  }

  handleCreateToken = async () => {
    const resp = await api.post("/api/token", {});
    this.setState({ token: resp?.token });
  };
  render() {
    let { token } = this.state;
    return (
      <div>
        {!token && (
          <button onClick={this.handleCreateToken}>Create Token</button>
        )}
        {token && <div>Your write token: {token}</div>}
      </div>
    );
  }
}
