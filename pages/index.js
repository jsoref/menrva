import React from "react";
import firebase from "firebase";
import UserSettings from "../components/UserSettings";

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null
    };
  }

  componentDidMount() {
    const config = {
      apiKey: "AIzaSyDaSF8PfdRA1mjztmQQKWV0v6BusUjvko4",
      authDomain: "sercy-2de63.firebaseapp.com",
      databaseURL: "https://sercy-2de63.firebaseio.com",
      projectId: "sercy-2de63",
      storageBucket: "sercy-2de63.appspot.com",
      messagingSenderId: "724512766832"
    };

    if (!firebase.apps?.length) {
      firebase.initializeApp(config);
    }

    if (!this.state.user) {
      this.setState({
        user: firebase.apps?.length && firebase.auth().currentUser
      });
    }
  }

  handleLogin = async () => {
    console.log("handle login");
    const provider = new firebase.auth.GithubAuthProvider();
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log("github token", token, user);
      this.setState({
        user
      });

      document.cookie = "__session=" + user.qa + ";max-age=3600";
    } catch (error) {
      console.log(error);
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    }
  };

  render() {
    let { user } = this.state;
    return (
      <div>
        <h1>Sercy</h1>

        <div>
          {user && <div>You're logged in as {user.displayName}</div>}
          {!user && (
            <button onClick={this.handleLogin}>Login with github</button>
          )}

          {user && <UserSettings />}
        </div>
      </div>
    );
  }
}

export default Index;
