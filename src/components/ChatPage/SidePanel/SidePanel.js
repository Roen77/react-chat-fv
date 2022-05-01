import React from "react";
import ChatRooms from "./ChatRooms";
import DirectMessage from "./DirectMessage";
import Favorited from "./Favorited";
import UserPanel from "./UserPanel";

function SidePanel() {
  return (
    <div
      style={{
        backgroundColor: "#7B83EB",
        padding: "2rem",
        minHeight: "100vh",
        color: "white",
        minWidth: "275px",
      }}
    >
      <UserPanel />
      <Favorited />
      <ChatRooms />
      <DirectMessage />
    </div>
  );
}

export default SidePanel;
