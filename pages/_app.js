import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import colors from "../constants/colors";
import ethersService from "../services/ethersService";
import "../styles/globals.css";

function Marketplace({ Component, pageProps }) {
  const [isAuthenticated, setAuthentication] = useState(false);

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
        <Link href="/current-round">
          <a className="font-bold bg-orangeC p-5 rounded-lg text-lg">
            Current Voting Round
          </a>
        </Link>
        <Link href="/contract-configs">
          <a className="font-bold bg-orangeC p-5 rounded-lg text-lg">
            Contract Configs
          </a>
        </Link>
      </NavBar>
      <Component {...pageProps} />
    </div>
  );
}

export default Marketplace;

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
  font-size: 3rem;
  color: white;
  cursor: pointer;
`;

const Button = styled.button`
  background-color: ${(props) =>
    props.clickable ? colors.red : colors.orange};
  color: ${(props) => (props.clickable ? "white" : "black")};
  border-radius: 6px;
  padding: 1.25rem;
  margin-left: auto;
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.75rem;

  &:hover {
    opacity: ${(props) => (props.clickable ? 0.6 : 1)};
  }
  transition: opacity 0.15s;
`;
