// src/components/Layout.jsx
import type React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
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
      <div style={{ width: "1000px" }}>{children}</div>
    </div>
  );
};

export default Layout;
