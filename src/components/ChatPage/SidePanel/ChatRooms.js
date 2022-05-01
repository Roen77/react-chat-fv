import React, { Component } from "react";
import { FaRegSmileWink, FaPlus } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { connect } from "react-redux";
import firebase from "../../../firebase";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/chatRoom_action";
import { Badge } from "react-bootstrap";
export class ChatRooms extends Component {
  state = {
    show: false,
    name: "",
    description: "",
    chatRoomsRef: firebase.database().ref("chatRooms"),
    messagesRef: firebase.database().ref("messages"),
    chatRooms: [],
    firstLoad: true,
    activeChatRoomId: "",
    notifications: [],
  };
  componentDidMount() {
    this.AddChatRoomsListeners();
  }
  componentWillUnmount() {
    this.state.chatRoomsRef.off();
    this.state.chatRooms.forEach((chatRoom) => {
      this.state.messagesRef.child(chatRoom.id).off();
    });
  }
  AddChatRoomsListeners = () => {
    console.log("addchatROOM 실행");
    let chatRoomsArray = [];
    this.state.chatRoomsRef.on("child_added", (DataSnapshot) => {
      chatRoomsArray.push(DataSnapshot.val());
      // console.log("chat 값:", DataSnapshot.val(), "배열:", chatRoomsArray);
      this.setState({ chatRooms: chatRoomsArray }, () =>
        this.setFirstChatRoom()
      );
      this.addNotificationListeners(DataSnapshot.key);
    });
  };

  handleNotification = (
    chatRoomId,
    currentChatRoomId,
    notifications,
    DataSnapShot
  ) => {
    // 이미 notifications state 안에 알림정보가 들어있는 채팅방과 그렇지 않은 채팅방 나눠주기
    let index = notifications.findIndex(
      (notification) => notification.id === chatRoomId
    );
    console.log("index확인:", index);
    let lastTotal = 0;
    // notificaions state안에 해당 채팅방의 알림정보가 없을때
    if (index === -1) {
      notifications.push({
        id: chatRoomId,
        total: DataSnapShot.numChildren(),
        lastKnownTotal: DataSnapShot.numChildren(),
        count: 0,
      });
    } else {
      // notificaions state안에 해당 채팅방의 알림정보가 있을때
      // 상대방이 채팅 보내는 그 해당 채팅방에 있지 않을때
      console.log(
        "게산이왜안됌",
        "chatRoomId:",
        chatRoomId,
        "current:",
        currentChatRoomId,
        "비고:",
        chatRoomId !== currentChatRoomId
      );
      if (chatRoomId !== currentChatRoomId) {
        // 현재까지 유저가 확인한 총 메세지 개수
        lastTotal = notifications[index].lastKnownTotal;
        //  count 알림으로 보여줄 숫자 구하기
        // 현재 총 메세지갯수 - 이전에 확인한 총 메세지 갯수>0
        if (DataSnapShot.numChildren() - lastTotal > 0) {
          notifications[index].count = DataSnapShot.numChildren() - lastTotal;
        }
      }
      // total property에 현재 전체메세지 갯수를 넣어주기
      notifications[index].total = DataSnapShot.numChildren();
    }
    // state에 저장
    console.log("notification:", this.state.notifications);
    this.setState({ notifications });
  };

  addNotificationListeners = (chatRoomId) => {
    console.log(" addNotificationListeners 메세지실행", "방id:", chatRoomId);
    this.state.messagesRef.child(chatRoomId).on("value", (DataSnapshot) => {
      if (this.props.chatRoom) {
        this.handleNotification(
          chatRoomId,
          this.props.chatRoom.id,
          this.state.notifications,
          DataSnapshot
        );
      }
    });
  };
  setFirstChatRoom = () => {
    const firstChatRoom = this.state.chatRooms[0];
    if (this.state.firstLoad && this.state.chatRooms.length > 0) {
      this.props.dispatch(setCurrentChatRoom(firstChatRoom));
      this.setState({ activeChatRoomId: firstChatRoom.id });
    }
    this.setState({ firstLoad: false });
  };
  handleClose = () => this.setState({ show: false });
  handleShow = () => this.setState({ show: true });
  handleSubmit = (e) => {
    e.preventDefault();
    const { name, description } = this.state;

    if (this.isFormValid(name, description)) {
      this.addChatRoom();
    }
  };
  addChatRoom = async () => {
    const { name, description } = this.state;
    const { user } = this.props;
    const key = this.state.chatRoomsRef.push().key;
    const newChatRoom = {
      id: key,
      name,
      description,
      createdBy: {
        name: user.displayName,
        image: user.photoURL,
      },
    };
    try {
      await this.state.chatRoomsRef.child(key).update(newChatRoom);
      this.setState({
        name: "",
        description: "",
        show: false,
      });
      console.log("생성 완료");
    } catch (error) {
      alert(error);
    }
  };
  isFormValid = (name, description) => {
    return name && description;
  };

  changeChatRoom = (room) => {
    this.props.dispatch(setCurrentChatRoom(room));
    this.props.dispatch(setPrivateChatRoom(false));
    this.setState({ activeChatRoomId: room.id });
    this.clearNotifications();
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.props.chatRoom.id
    );
    if (index !== -1) {
      let updateNotifications = [...this.state.notifications];
      updateNotifications[index].lastKnownTotal =
        this.state.notifications[index].total;
      updateNotifications[index].count = 0;
      this.setState({ notifications: updateNotifications });
    }
  };

  getNotificationCouont = (room) => {
    // 해당 채팅방의 count 수를 구하는중..
    let count = 0;
    this.state.notifications.forEach((notification) => {
      if (notification.id === room.id) {
        count = notification.count;
        console.log(notification, "noti확인");
      }
    });
    if (count > 0) return count;
  };

  renderChatRooms = (chatRooms) =>
    chatRooms.length > 0 &&
    chatRooms.map((room) => (
      <li
        key={room.id}
        style={{
          backgroundColor:
            room.id === this.state.activeChatRoomId && "#ffffff45",
        }}
        onClick={() => this.changeChatRoom(room)}
      >
        # {room.name}
        <Badge style={{ float: "right", marginTop: "4px" }} variant="denger">
          {this.getNotificationCouont(room)}
        </Badge>
      </li>
    ));
  render() {
    return (
      <div>
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaRegSmileWink style={{ marginRight: 3 }} />
          CHAT ROOMS (1)
          <FaPlus
            onClick={this.handleShow}
            style={{
              position: "absolute",
              right: 0,
              cursor: "pointer",
            }}
          />
        </div>
        {/* list */}
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {this.renderChatRooms(this.state.chatRooms)}
        </ul>
        {/* modal */}
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create a chat room</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* form */}
            <Form onSubmit={this.handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>방 이름</Form.Label>
                <Form.Control
                  type="text"
                  onChange={(e) => this.setState({ name: e.target.value })}
                  placeholder="Enter chat name"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>방 설명</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="방 설명을 입력해주세요."
                  onChange={(e) =>
                    this.setState({ description: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleSubmit}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
const mapStateProps = (state) => {
  return {
    user: state.user.currentUser,
    chatRoom: state.chatRoom.currentChatRoom,
  };
};
export default connect(mapStateProps)(ChatRooms);
