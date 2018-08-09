import App, { Container } from "next/app";
import React from "react";
import styled, { hydrate, keyframes, css, injectGlobal } from "react-emotion";
import firebase from "firebase";

import reset from "../styles/reset";
import theme from "../styles/theme";
import Link from "next/link";
import api from "../util/api";
import initFirebase from "../util/initFirebase";

// Adds server generated styles to emotion cache.
// '__NEXT_DATA__.ids' is set in '_document.js'
if (typeof window !== "undefined") {
  hydrate(window.__NEXT_DATA__.ids);
}

injectGlobal`
  ${reset}
`;

export default class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };
  }

  componentDidCatch() {
    console.error("component did catch");
    // TODO: Add Sentry
  }

  componentDidMount() {
    console.log("app cdm");
    initFirebase();
    if (!this.state.user) {
      this.setState({
        user: firebase.apps?.length && firebase.auth().currentUser,
      });

      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          console.log("auth state changed", user);
          this.setState({ user });
          // User is signed in.
        } else {
          // No user is signed in.
        }
      });
    }
  }

  handleLogin = async () => {
    const provider = new firebase.auth.GithubAuthProvider();
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      const githubToken = result.credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      this.setState({
        user,
      });

      api.post(
        "/api/user",
        {
          githubToken,
          userInfo: result.additionalUserInfo,
        },
        { token: user.qa }
      );

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
    const { Component, pageProps } = this.props;
    let { user } = this.state;

    return (
      <Container>
        <SiteBody>
          <SiteHeader>
            <Link href="/">
              <HomeLink>
                MENRV
                <span style={{ marginLeft: "-2px" }}>A</span>
              </HomeLink>
            </Link>
            <UserInfo>
              {user ? (
                <div>{user.displayName}</div>
              ) : (
                <div onClick={this.handleLogin}>Login</div>
              )}
            </UserInfo>
          </SiteHeader>
          {user && <Component {...pageProps} />}
        </SiteBody>
      </Container>
    );
  }
}

const SiteHeader = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3em;
  width: 100%;
  border-bottom: 1px solid ${theme.gray5};
  background: ${theme.gray8};
`;

const HomeLink = styled("div")`
  display: block;
  text-align: center;
  font-weight: bold;
  text-decoration: none;
  color: ${theme.gray1};
  padding: 0.75em 0;
  font-size: 1.2em;
  cursor: pointer;

  &:hover {
    color: ${theme.activeColor};
  }
`;

const UserInfo = styled("div")`
  color: ${theme.gray1};
  text-transform: uppercase;
  font-size: 0.8em;
  cursor: pointer;
`;

const SiteBody = styled("div")`
  font-family: ${theme.fontFamily};
`;
