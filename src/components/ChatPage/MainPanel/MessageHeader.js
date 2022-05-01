import React, { useCallback, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  InputGroup,
  FormControl,
  Accordion,
  Image,
  Figure,
} from "react-bootstrap";
import firebase from "../../../firebase";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { AiOutlineSearch } from "react-icons/ai";
import { useSelector } from "react-redux";
function MessageHeader({ handleSearchChange }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const isPrivateChatRoom = useSelector(
    (state) => state.chatRoom.isPrivateChatRoom
  );
  const user = useSelector((state) => state.user.currentUser);
  const usersRef = firebase.database().ref("users");
  const userPosts = useSelector((state) => state.chatRoom.userPosts);
  console.log("messageheader:", userPosts);

  const addFavoriteListener = useCallback(
    (userId, chatRoomId) => {
      usersRef
        .child(userId)
        .child("favorited")
        .once("value")
        .then((data) => {
          if (data.val() !== null) {
            const chatRoomIds = Object.keys(data.val());
            const isAlreadyFavorited = chatRoomIds.includes(chatRoomId);
            console.log("favorited 체크", isAlreadyFavorited);
            setIsFavorited(isAlreadyFavorited);
          }
        });
    },
    [usersRef]
  );
  useEffect(() => {
    if (chatRoom && user) {
      addFavoriteListener(user.uid, chatRoom.id);
    }
  }, [user, chatRoom]);

  const renderUserPosts = (userPosts) => {
    console.log(
      "!!!!!!!!!!!!!!!!!!!!!!!!!!:",
      Object.entries(userPosts).sort((a, b) => b[1].count - a[1].count)
    );
    return Object.entries(userPosts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, val], i) => (
        <Figure key={i} style={{ display: "flex" }}>
          <Figure.Image
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              width: "48px",
              height: "48px",
              marginRight: "10px",
            }}
            src={val.image}
            alt={val.name}
          />
          <Figure.Caption>
            <h6>{key}</h6>
            <p>{val.count}개</p>
          </Figure.Caption>
        </Figure>
      ));
  };

  const handleFavorite = () => {
    if (isFavorited) {
      usersRef
        .child(`${user.uid}/favorited`)
        .child(chatRoom.id)
        .remove((err) => {
          if (err !== null) {
            console.log(err);
          }
        });
      setIsFavorited((prev) => !prev);
    } else {
      usersRef.child(`${user.uid}/favorited`).update({
        [chatRoom.id]: {
          name: chatRoom.name,
          description: chatRoom.description,
          createdBy: {
            name: chatRoom.createdBy.name,
            image: chatRoom.createdBy.image,
          },
        },
      });
      setIsFavorited((prev) => !prev);
    }
  };
  return (
    <div
      style={{
        width: "100%",
        height: "170px",
        border: ".2rem solid #ececec",
        borderRadius: "4px",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      <Container>
        <Row>
          <Col>
            <h2>
              {isPrivateChatRoom ? (
                <FaLock style={{ marginBottom: "10px" }} />
              ) : (
                <FaLockOpen style={{ marginBottom: "10px" }} />
              )}
              {chatRoom && chatRoom.name}

              {!isPrivateChatRoom && (
                <span style={{ cursor: "pointer" }} onClick={handleFavorite}>
                  {isFavorited ? (
                    <MdFavorite style={{ marginBottom: "10px" }} />
                  ) : (
                    <MdFavoriteBorder style={{ marginBottom: "10px" }} />
                  )}
                </span>
              )}
            </h2>
          </Col>
          <Col>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">
                {" "}
                <AiOutlineSearch />
              </InputGroup.Text>
              <FormControl
                onChange={handleSearchChange}
                placeholder="search"
                aria-label="search"
                aria-describedby="basic-addon1"
              />
            </InputGroup>
          </Col>
        </Row>

        {!isPrivateChatRoom && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <p>
              <Image
                src={chatRoom && chatRoom.createdBy.image}
                roundedCircle
                style={{ width: "30px", height: "30px" }}
              />
              {chatRoom && chatRoom.createdBy.name}
            </p>
          </div>
        )}
        <Row>
          <Col>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Description</Accordion.Header>
                <Accordion.Body>
                  {chatRoom && chatRoom.description}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
          <Col>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Posts Count</Accordion.Header>
                <Accordion.Body>
                  {userPosts && renderUserPosts(userPosts)}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default MessageHeader;
