import styled from 'styled-components'
import colors from "./colors";

export const InputField = styled.input.attrs({
  className: 'w-full border rounded p-4'
})``;

export const CardContainer = styled.div.attrs({
  classname: 'p-5 rounded-lg mt-5 bg-white'
})``;

export const Header = styled.div.attrs({
  className: 'flex text-2xl font-bold text-redC'
})``;

export const BodyContainer = styled.div.attrs({
  className: 'flex flex-col text-xl font-bold gap-y-5 mt-5'
})``;

export const SubHeader = styled.div.attrs({
  className: 'font-lg text-orangeC font-bold'
})``;

export const Button = styled.button`
  background-color: ${(props) =>
    props.clickable ? colors.blue : colors.yellow};
  color: ${(props) => (props.clickable ? "white" : "black")};
  border-radius: 6px;
  padding: 8px 20px;

  &:hover {
    opacity: ${(props) => (props.clickable ? 0.6 : 1)};
  }
  transition: opacity 0.15s;
`;