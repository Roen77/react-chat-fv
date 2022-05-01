import React, { Component } from "react";
import { FaRegSmile } from "react-icons/fa";
import { connect } from "react-redux";
import firebase from "../../../firebase";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/chatRoom_action";
export class DirectMessage extends Component {
  state = {
    users: [],
    usersRef: firebase.database().ref("users"),
    activeChatRoom: "",
  };
  componentDidMount() {
    if (this.props.user) {
      this.addUserListeners(this.props.user.uid);
    }
  }
  addUserListeners = (currentUserId) => {
    const { usersRef } = this.state;
    let userArray = [];
    usersRef.on("child_added", (DataSnapShot) => {
      if (currentUserId !== DataSnapShot.key) {
        // console.log("datesnapshot value:", DataSnapShot.val());
        let user = DataSnapShot.val();
        user["uid"] = DataSnapShot.key;
        user["status"] = "offline";
        userArray.push(user);
        this.setState({ users: userArray });
      }
    });
  };
  getChatRoomId = (userId) => {
    const currentUserId = this.props.user.uid;
    return userId > currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  setActiveChatRoom = (userId) => {
    this.setState({ activeChatRoom: userId });
  };

  changeChatRoom = (user) => {
    const chatRoomId = this.getChatRoomId(user.uid);
    const chatRoomData = {
      id: chatRoomId,
      name: user.name,
    };
    this.props.dispatch(setCurrentChatRoom(chatRoomData));
    this.props.dispatch(setPrivateChatRoom(true));
    this.setActiveChatRoom(user.uid);
  };

  renderDirectMessages = (users) =>
    users.length > 0 &&
    users.map((user) => (
      <li
        key={user.uid}
        onClick={() => this.changeChatRoom(user)}
        style={{
          backgroundColor:
            this.state.activeChatRoom === user.uid && "#ffffff45",
        }}
      >
        # {user.name}
      </li>
    ));
  render() {
    // console.log("users", this.state.users);
    const { users } = this.state;
    return (
      <div>
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaRegSmile style={{ marginRight: 3 }} /> DIRECT MESSAGES(1)
        </span>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {this.renderDirectMessages(users)}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(DirectMessage);
