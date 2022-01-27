import styled from 'styled-components';
import { TabList, Tabs } from 'react-tabs';

export const Wrapper = styled.div`
  margin-bottom: 35px;
`;

export const TabListFarmType = styled(TabList)`
  display: flex;
  align-items: center;
 li {
   margin-right: 50px;
 }

  @media screen and (max-width: 768px) {
    li {
      margin-right: 20px;
    }
  }
`;

export const TabsFarmType = styled(Tabs)`
  color: ${({ theme }) => theme.farmText};
  font-weight: 600;
  font-size: 18px;
  line-height: 126, 5%;
  letter-spacing: 0.015rem;

  @media screen and (max-width: 768px) {
    padding-top: 0;
    font-size: 16px;
  }

  .selected {
    color: ${({ theme }) => theme.tabActive};
    position: relative;

    ::before {
      content: '';
      display: inline-block;
      height: 2px;
      width: 100%;
      position: absolute;
      left: 0;
      bottom: -5px;
      background: ${({ theme }) => theme.primary1};
    }
  }
`;
