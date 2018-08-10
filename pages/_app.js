import App, { Container } from "next/app";
import React from "react";
import styled, { hydrate, injectGlobal } from "react-emotion";
import firebase from "firebase";

import reset from "../styles/reset";
import theme from "../styles/theme";
import Avatar from "../components/Avatar";
import LogoFullDark from "../components/svg/LogoFullDark";
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
  static async getInitialProps({ Component, ctx }) {
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

  async getRepos() {
    const repos = await api.get("/api/repos");
    this.setState({ repos });
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
          this.getRepos();
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
    }
  };

  render() {
    const { Component, pageProps } = this.props;
    let { user, repos } = this.state;

    return (
      <Container>
        <SiteBody>
          <SiteSidebar>
            <SiteHeader>
              <Link href="/">
                <HomeLink>
                  <StyledLogoFullDark />
                </HomeLink>
              </Link>
            </SiteHeader>
            {repos ? (
              <div>
                {repos.map((repo, i) => (
                  <Repo key={i}>
                    <Link href={{ pathname: "/builds", query: { repo } }}>
                      <a>{repo}</a>
                    </Link>
                  </Repo>
                ))}
              </div>
            ) : null}
          </SiteSidebar>
          <UserInfo>
            {user ? (
              <StyledAvatar image={user.photoURL} />
            ) : (
              <div onClick={this.handleLogin}>Login</div>
            )}
          </UserInfo>
          <SiteContent>{user && <Component {...pageProps} />}</SiteContent>
        </SiteBody>
      </Container>
    );
  }
}

const SiteSidebar = styled("div")`
  background: ${theme.gray10};
  width: 30vw;
  max-width: 350px;
  min-width: 200px;
  min-height: 100vh;
`;

const SiteHeader = styled("div")`
  display: flex;
  align-items: center;
  padding: 0 1em;
  width: 100%;
  position: relative;

  &:after {
    content: "";
    display: block;
    background: linear-gradient(to right, ${theme.red}, ${theme.yellow});
    height: 1px;
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
  }
`;

const StyledLogoFullDark = styled(LogoFullDark)`
  height: 1.7em;
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
  display: flex;
  position: absolute;
  right: 1em;
  top: 0.85em;
  z-index: 999;
`;

const StyledAvatar = styled(Avatar)`
  width: 3em;
  height: 3em;
`;

const SiteContent = styled("div")`
  flex: 1;
  position: relative;
`;

const SiteBody = styled("div")`
  font-family: ${theme.fontFamily};
  display: flex;
  background: ${theme.gray1};
`;

const Repo = styled("div")`
  background-color: ${theme.gray9};
  border-radius: 4px;
  margin: 0.75em;
  transition: 0.2s background;

  a {
    font-size: 0.9em;
    padding: 1em;
    width: 100%
    height: 100%;
    display: block;
    border-radius: 4px;
    color: #fff;
    text-decoration: none;
  }

  &:hover {
    background: ${theme.gray8};
  }
`;
