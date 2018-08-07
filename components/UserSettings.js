import React from "react";
import axios from "axios";
import firebase from "firebase";

export default class UserSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = { token: null };
  }

  async componentDidMount() {
    console.log("did mount");
    const idToken = await firebase.auth().currentUser?.getIdToken();
    const resp = await axios.get("/api/token/", {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
    this.setState({ token: resp?.data?.token });
  }

  handleGetToken = async () => {
    console.log("get token");
    const idToken = await firebase.auth().currentUser?.getIdToken();
    const resp = await axios.post(
      "/api/token/",
      {},
      {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }
    );

    this.setState({ token: resp?.token });
  };
  render() {
    let { token } = this.state;
    console.log("render", this.state.token);
    return (
      <div>
        {!token && <button onClick={this.handleGetToken}>Get Token</button>}
        {token && <div>Your write token: {token}</div>}
      </div>
    );
  }
}
