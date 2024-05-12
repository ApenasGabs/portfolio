import { Menu, MenuProps } from "antd";
import { useState } from "react";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    label: (
      <a target="_blank" href="https://econow.apenasgabs.dev">
        EcoNow
      </a>
    ),
    key: "EcoNow",
  },
  {
    key: "apenasblog",
    label: (
      <a target="_blank" href="https://apenasblog.vercel.app/">
        ApenasBlog
      </a>
    ),
  },
  {
    key: "apenasblog",
    label: (
      <a target="_blank" href="https://ghibli.list.apenasgabs.dev">
        Ghibli film list
      </a>
    ),
  },
  // {
  //   label: "Navigation Three - Submenu",
  //   key: "SubMenu",
  //   icon: <SettingOutlined />,
  //   children: [
  //     {
  //       type: "group",
  //       label: "Item 1",
  //       children: [
  //         { label: "Option 1", key: "setting:1" },
  //         { label: "Option 2", key: "setting:2" },
  //       ],
  //     },
  //     {
  //       type: "group",
  //       label: "Item 2",
  //       children: [
  //         { label: "Option 3", key: "setting:3" },
  //         { label: "Option 4", key: "setting:4" },
  //       ],
  //     },
  //   ],
  // },
];
const Navbar = () => {
  const [current, setCurrent] = useState("mail");

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};

export default Navbar;
