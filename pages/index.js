import styled from "styled-components";
import colors from "../constants/colors";

export default function Index() {
  return (
    <Container>
      <Title>Welcome to PolyShare.</Title>
      <SubTitle>
        Nothing to do with Polygon. Everything to do with social impact.
      </SubTitle>
      <ConnectNow>
        Connect your MetaMask wallet now to make a difference.
      </ConnectNow>
    </Container>
  );
}

const Container = styled.section`
  height: calc(100vh - 93px);
  background-color: ${colors.blue};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h1 {
    text-align: center;
    color: white;
  }
`;

const Title = styled.h1`
  font-size: 5rem;
`;

const SubTitle = styled.h1`
  font-size: 1.75rem;
  margin-bottom: 50px;
`;

const ConnectNow = styled.h1`
  font-size: 1rem;
`;
