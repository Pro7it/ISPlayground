import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "./App.css";
import "react-tabs/style/react-tabs.css";

import Lab1 from "./pages/Lab1";
import Lab2 from "./pages/Lab2";
import Lab3 from "./pages/Lab3";

function App() {
  return (
    <div style={{ maxWidth: "900px", margin: "40px auto" }}>
      <h1>Захист інформації</h1>

      <Tabs>
        <TabList>
          <Tab>ЛР №1 – ГПВЧ</Tab>
          <Tab>ЛР №2 – MD5</Tab>
          <Tab>ЛР №3 – RC5</Tab>
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
  );
}

export default App;
