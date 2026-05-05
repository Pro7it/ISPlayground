import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
// import "react-tabs/style/react-tabs.css";

import Lab1 from "./pages/Lab1";
import Lab2 from "./pages/Lab2";
import Lab3 from "./pages/Lab3";
import { Typography } from "antd";
import Lab4 from "./pages/Lab4";
import Lab5 from "./pages/Lab5";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <Typography.Title level={2}>Захист інформації</Typography.Title>

      <div style={{ width: "1500px" }}>
        <Tabs>
          <TabList>
            <Tab>ГПВЧ</Tab>
            <Tab>MD5</Tab>
            <Tab>RC5</Tab>
            <Tab>RSA</Tab>
            <Tab>DSS</Tab>
          </TabList>

          <TabPanel>
            <Lab1 />
          </TabPanel>

          <TabPanel>
            <Lab2 />
          </TabPanel>

          <TabPanel>
            <Lab3 />
          </TabPanel>

          <TabPanel>
            <Lab4 />
          </TabPanel>

          <TabPanel>
            <Lab5 />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
