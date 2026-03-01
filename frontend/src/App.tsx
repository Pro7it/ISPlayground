import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
// import "react-tabs/style/react-tabs.css";

import Lab1 from "./pages/Lab1";
import Lab2 from "./pages/Lab2";
import Lab3 from "./pages/Lab3";
import { Typography } from "antd";

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
        </Tabs>
      </div>
    </div>
  );
}

export default App;
