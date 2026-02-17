import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Layout from "./components/Layout";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Layout>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Layout>,
);
