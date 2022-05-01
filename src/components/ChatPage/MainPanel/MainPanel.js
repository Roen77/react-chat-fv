import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import MessageForm from "./MessageForm";
import MessageHeader from "./MessageHeader";
import firebase from "../../../firebase";
import Message from "./Message";
import { setUserPosts } from "../../../redux/actions/chatRoom_action";
import Skeleton from "../../../commons/components/Skeleton";

class MainPanel extends Component {
  messageEndRef = createRef();
  state = {
    messagesRef: firebase.database().ref("messages"),
    typingRef: firebase.database().ref("typing"),
    messages: [],
    messagesLoading: true,
    searchTerm: "",
    searchResults: [],
    searchLoading: false,
    typingUsers: [],
    listenerLists: [],
  };
  componentDidMount() {
    const { chatRoom } = this.props;
    // console.log("MainPanel 왜 안지켜보지..", chatRoom);
    if (chatRoom) {
      // console.log("실행이안됨");
      this.addMessagesListeners(chatRoom.id);
      this.addTypingListeners(chatRoom.id);
    }
  }

  componentDidUpdate() {
    if (this.messageEndRef) {
      this.messageEndRef.scrollIntoView({ behavior: "smooth" });
    }
  }

  componentWillUnmount() {
    this.state.messagesRef.off();
    this.removeListners(this.state.listenerLists);
  }

  removeListners = (listeners) => {
    listeners.forEach((listner) => {
      listner.ref.child(listner.id).off(listner.event);
    });
  };

  handleSearchMessages = () => {
    const chatRoomMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = chatRoomMessages.reduce((acc, message) => {
      if (message.content?.match(regex) || message?.user.name?.match(regex)) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
  };

  handleSearchChange = (e) => {
    this.setState(
      {
        searchTerm: e.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessages()
    );
  };
  addTypingListeners = (chatRoomId) => {
    let typingUsers = [];
    // 타이핑이 새로 들어올때
    this.state.typingRef.child(chatRoomId).on("child_added", (DataSnapShot) => {
      if (DataSnapShot.key !== this.props.user.uid) {
        typingUsers = typingUsers.concat({
          id: DataSnapShot.key,
          name: DataSnapShot.val(),
        });
        this.setState({ typingUsers });
      }
    });
    // 리스너삭제하려고 등록된 리스터 넣어주기
    this.addToListenerLists(chatRoomId, this.state.typingRef, "child_added");
    // 타이핑 지워줄때
    this.state.typingRef
      .child(chatRoomId)
      .on("child_removed", (DataSnapShot) => {
        const index = typingUsers.findIndex(
          (user) => user.id === DataSnapShot.key
        );
        if (index !== -1) {
          typingUsers = typingUsers.filter(
            (user) => user.id !== DataSnapShot.key
          );
          this.setState({ typingUsers });
        }
      });
    // 리스너삭제하려고 등록된 리스터 넣어주기
    this.addToListenerLists(chatRoomId, this.state.typingRef, "child_removed");
  };

  addToListenerLists = (id, ref, event) => {
    //이미 등록된 리스너인지 확인
    const index = this.state.listenerLists.findIndex((listner) => {
      return (
        listner.id === id && listner.ref === ref && listner.event === event
      );
    });

    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({
        listenerLists: this.state.listenerLists.concat(newListener),
      });
    }
  };
  addMessagesListeners = (chatRoomId) => {
    let messagesArray = [];
    this.state.messagesRef
      .child(chatRoomId)
      .on("child_added", (DataSnapShot) => {
        messagesArray.push(DataSnapShot.val());
        this.setState({ messages: messagesArray, messagesLoading: false });
      });
    this.userPostCount(messagesArray);
  };

  userPostCount = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          image: message.user.image,
          count: 1,
        };
      }
      return acc;
    }, {});
    console.log("userposts", userPosts);
    this.props.dispatch(setUserPosts(userPosts));
  };
  renderMessages = (messages) => {
    return (
      messages.length > 0 &&
      messages.map((message, i) => (
        <Message key={i} message={message} user={this.props.user} />
      ))
    );
  };

  renderTypingUsers = (typingUsers) =>
    typingUsers.length > 0 &&
    typingUsers.map((user, i) => (
      <span key={i}>{user.name}님이 채팅을 입력하고 있습니다...</span>
    ));

  renderMessageSkeleton = (loading) =>
    loading && (
      <>
        {[...Array(10)].map((v, i) => (
          <Skeleton key={i} />
        ))}
      </>
    );

  render() {
    const {
      messages,
      searchTerm,
      searchResults,
      typingUsers,
      messagesLoading,
    } = this.state;
    return (
      <div style={{ padding: "2rem 2rem 0 2rem" }}>
        <MessageHeader handleSearchChange={this.handleSearchChange} />

        <div
          style={{
            width: "100%",
            height: "450px",
            border: ".2rem solid #ececec",
            borderRadius: "4px",
            padding: "1rem",
            marginBottom: "1rem",
            overflowY: "auto",
          }}
        >
          {this.renderMessageSkeleton(messagesLoading)}
          {searchTerm
            ? this.renderMessages(searchResults)
            : this.renderMessages(messages)}

          {this.renderTypingUsers(typingUsers)}
          <div ref={(node) => (this.messageEndRef = node)}></div>
          <div ref={(node) => (this.messageEndRef = node)} />
        </div>

        <MessageForm />
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
export default connect(mapStateProps)(MainPanel);
