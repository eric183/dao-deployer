import React from 'react';
import { Nav, NavProps } from 'rsuite';

interface TabsProps extends NavProps {
  tabItems?: Array<{
    eventKey: string;
    itemName: string;
  }>;
}

const Tabs: React.FC<TabsProps> = ({
  activeKey,
  onSelect,
  tabItems,
  ...props
}) => {
  return (
    <Nav
      {...props}
      activeKey={activeKey}
      appearance="subtle"
      onSelect={onSelect}
    >
      {tabItems?.map((item) => (
        <Nav.Item eventKey={item.eventKey} key={item.eventKey}>
          {item.itemName}
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default Tabs;
