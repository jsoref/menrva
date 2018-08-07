import React from "react";
import axios from "axios";

export default class UserSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = { token: null };
  }

  async componentDidMount() {
    console.log("did mount");
    const idToken = await firebase.auth().currentUser?.getIdToken();
    const token = await axios.get("/api/token/", {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
    // this.setState({ token });
  }

  handleGetToken = async () => {
    console.log("get token");
    const token = await axios.post("/api/token/");
    // this.setState({ token });
  };
  render() {
    let { token } = this.state;
    return (
      <div>
        {!token && <button onClick={this.handleGetToken}>Get Token</button>}
        {token && <div>Your write token: {token}</div>}
      </div>
    );
  }
}
