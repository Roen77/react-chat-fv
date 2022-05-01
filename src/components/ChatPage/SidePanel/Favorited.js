import { FaRegSmileBeam } from "react-icons/fa";
import firebase from "../../../firebase";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/chatRoom_action";

export class Favorited extends Component {
  state = {
    usersRef: firebase.database().ref("users"),
    favoritedChatRooms: [],
    activeChatRoomId: "",
  };
  componentDidMount() {
    if (this.props.user) {
      this.addListeners(this.props.user.uid);
    }
  }
  componentWillUnmount() {
    if (this.props.user) {
      this.removeListeners(this.props.user.uid);
    }
  }
  removeListeners = (userId) => {
    const { usersRef } = this.state;
    usersRef.child(`${userId}/favorited`).off();
  };
  addListeners = (userId) => {
    const { usersRef } = this.state;
    usersRef
      .child(userId)
      .child("favorited")
      .on("child_added", (DataSnapShot) => {
        const favoritedChatRoom = {
          id: DataSnapShot.key,
          ...DataSnapShot.val(),
        };
        this.setState({
          favoritedChatRooms: [
            ...this.state.favoritedChatRooms,
            favoritedChatRoom,
          ],
        });
      });

    // 삭제
    usersRef
      .child(userId)
      .child("favorited")
      .on("child_removed", (DataSnapShot) => {
        const chatRoomToRemove = {
          id: DataSnapShot.key,
          ...DataSnapShot.val(),
        };
        const filteredChatRooms = this.state.favoritedChatRooms.filter(
          (chatRoom) => {
            return chatRoom.id !== chatRoomToRemove.id;
          }
        );
        this.setState({ favoritedChatRooms: filteredChatRooms });
      });
  };

  changeChatRoom = (room) => {
    this.props.dispatch(setCurrentChatRoom(room));
    this.props.dispatch(setPrivateChatRoom(false));
    this.setState({ activeChatRoomId: room.id });
  };

  renderFavoritedChatRooms = (favoritedChatRooms) =>
    favoritedChatRooms.length > 0 &&
    favoritedChatRooms.map((chat) => (
      <li
        key={chat.id}
        onClick={() => this.changeChatRoom(chat)}
        style={{
          backgroundColor:
            chat.id === this.state.activeChatRoomId && "#ffffff45",
        }}
      >
        {" "}
        # {chat.name}
      </li>
    ));

  render() {
    const { favoritedChatRooms } = this.state;
    return (
      <div>
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaRegSmileBeam style={{ marginRight: "3px" }} />
          FAVORITED
        </span>
        <ul style={{ listStyleType: "none", padding: "0" }}>
          {this.renderFavoritedChatRooms(favoritedChatRooms)}
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
export default connect(mapStateToProps)(Favorited);
