import React from "react";
import { Figure } from "react-bootstrap";
import moment from "moment";
function Message({ message, user }) {
  const timeFromNow = (timestamp) => moment(timestamp).fromNow();
  const isImage = (message) => {
    return (
      message.hasOwnProperty("image") && !message.hasOwnProperty("content")
    );
  };
  const isMe = (message, user) => {
    if (user) {
      return message.user.id === user.uid;
    }
  };
  return (
    <div>
      <Figure style={{ display: "flex" }}>
        <Figure.Image
          style={{
            borderRadius: "10px",
            overflow: "hidden",
            width: "48px",
            height: "48px",
            marginRight: "10px",
          }}
          src={message.user.image}
          alt={message.user.name}
        />
        <Figure.Caption
          style={{
            backgroundColor: isMe(message, user) && "#ececec",
            width: "100%",
          }}
        >
          <h6>
            {message.user.name}
            <span style={{ fontSize: "10px", color: "gray" }}>
              {timeFromNow(message.timestamp)}
            </span>
          </h6>
          {isImage(message) ? (
            <img
              style={{ maxWidth: "300px" }}
              src={message.image}
              alt="이미지"
            />
          ) : (
            <p>{message.content}</p>
          )}
        </Figure.Caption>
      </Figure>
    </div>
  );
}

export default Message;
