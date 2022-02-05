import { useState } from "react";
import Link from 'next/link';
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
        <Title>PolyShare</Title>
        {renderAuthButton()}
        <Link href="/ongoing-donations">
          <a className="font-bold">
            Ongoing Donation
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
`;

const Title = styled.h1`
  font-size: 3rem;
`;

const Button = styled.button`
  background-color: ${(props) =>
    props.clickable ? colors.blue : colors.yellow};
  color: ${(props) => (props.clickable ? "white" : "black")};
  border-radius: 6px;
  padding: 8px 20px;
  margin-left: auto;
  margin-right: 20px;

  &:hover {
    opacity: ${(props) => (props.clickable ? 0.6 : 1)};
  }
  transition: opacity 0.15s;
`;
