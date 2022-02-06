import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styled from "styled-components";
import colors from "../constants/colors";
import ethersService from "../services/ethersService";
import "../styles/globals.css";

function App({ Component, pageProps }) {
  const [isAuthenticated, setAuthentication] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // prevents users from refreshing the page and accessing protected routes
    // without connecting wallet first
    if (!isAuthenticated) {
      router.push("/");
    } else {
      // if user is connected, determine if we should show privileged pages
      ethersService
        .isUserTheOwner()
        .then((bool) => setIsOwner(bool))
        .catch((e) => console.error(e));
    }
  }, [isAuthenticated]);

  const authenticate = async () => {
    await ethersService.authenticate();
    setAuthentication(ethersService.isAuthenticated());
  };

  const renderAuthButton = () =>
    isAuthenticated ? (
      <Button>Connected</Button>
    ) : (
      <Button clickable onClick={authenticate}>
        Connect
      </Button>
    );

  return (
    <div className="bg-beigeC min-h-screen">
      <NavBar>
        <Link href="/">
          <Title>PolyShare</Title>
        </Link>
        {renderAuthButton()}
        {isAuthenticated && (
          <>
            <Link href="/voting-page">
              <a className="font-bold bg-orangeC p-5 rounded-lg text-lg">
                Vote Now
              </a>
            </Link>
            <Link href="/current-round">
              <a className="font-bold bg-orangeC p-5 rounded-lg text-lg">
                Current Voting Round
              </a>
            </Link>
            {isOwner && (
              <Link href="/contract-configs">
                <a className="font-bold bg-orangeC p-5 rounded-lg text-lg">
                  Contract Configs
                </a>
              </Link>
            )}
          </>
        )}
      </NavBar>
      <Component {...pageProps} />
    </div>
  );
}

export default App;

const NavBar = styled.nav`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid ${colors.blue};
  gap: 10px;
  background-color: #083d77;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: white;
  cursor: pointer;
`;

const Button = styled.button`
  background-color: ${(props) => (props.clickable ? colors.red : colors.blue)};
  color: white;
  border-radius: 6px;
  padding: 1.25rem;
  margin-left: auto;
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.75rem;

  &:hover {
    opacity: ${(props) => (props.clickable ? 0.8 : 1)};
  }
  transition: opacity 0.15s;
`;
