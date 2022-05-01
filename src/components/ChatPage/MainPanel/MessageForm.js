import React, { useRef, useState } from "react";
import {
  InputGroup,
  FormControl,
  ProgressBar,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import firebase from "../../../firebase";
import extName from "ext-name";

function MessageForm() {
  const inputOpenImageRef = useRef();
  const storageRef = firebase.storage().ref();
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const isPrivateChatRoom = useSelector(
    (state) => state.chatRoom.isPrivateChatRoom
  );
  const user = useSelector((state) => state.user.currentUser);
  const messageRef = firebase.database().ref("messages");
  const typingRef = firebase.database().ref("typing");
  // console.log("per:", percentage);

  const handleChange = (e) => {
    setContent(e.target.value);
  };
  const handleOpenRef = () => {
    inputOpenImageRef.current.click();
  };

  const getPath = () => {
    if (isPrivateChatRoom) {
      return `/message/private/${chatRoom.id}`;
    } else {
      return `/message/public/${chatRoom.id}`;
    }
  };

  const createMessage = (fileURL = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        image: user.photoURL,
      },
    };

    if (fileURL !== null) {
      message["image"] = fileURL;
    } else {
      message["content"] = content;
    }
    return message;
  };
  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    const filePath = `${getPath()}/${file.name}`;
    const filetype = extName(file.name)[0]?.mime;
    const metadata = { contentType: filetype };
    setLoading(true);
    try {
      // 파일을 먼저 스토리지에 저장
      // let uploadTask = await storageRef.child(filePath).put(file, metadata);
      //파일을 먼저 스토리지에 저장
      let uploadTask = storageRef.child(filePath).put(file, metadata);
      uploadTask.on(
        "state_changed",
        (UploadTaskSnapshot) => {
          const percentage = Math.round(
            (UploadTaskSnapshot.bytesTransferred /
              UploadTaskSnapshot.totalBytes) *
              100
          );
          setPercentage(percentage);
        },
        (err) => {
          console.log(err);
          setLoading(false);
        },
        () => {
          // complete 부분
          // 저장이 다된후에 파일 메세지 전송(데이터베이스에저장)
          // 저장된파일을 다운받을수있는 url 가져오기
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            // console.log("url:", downloadURL);
            setLoading(false);
            messageRef
              .child(chatRoom.id)
              .push()
              .set(createMessage(downloadURL));
          });
        }
      );
    } catch (error) {
      alert(error);
    }
  };
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.keyCode === 13) {
      handleSubmit();
    }
    if (content) {
      typingRef.child(chatRoom.id).child(user.uid).set(user.displayName);
    } else {
      typingRef.child(chatRoom.id).child(user.uid).remove();
    }
  };
  const handleSubmit = async (e) => {
    // console.log("전송");
    // e.prevent;
    if (!content) {
      setErrors((prev) => prev.concat("type contents first"));
      return;
    }
    setLoading(true);
    // firebase에 데이터 저장
    try {
      await messageRef.child(chatRoom.id).push().set(createMessage());
      typingRef.child(chatRoom.id).child(user.uid).remove();
      setLoading(false);
      setContent("");
    } catch (error) {
      setErrors((pre) => pre.concat(error.message));
      setLoading(false);
      setTimeout(() => {
        setErrors([]);
      }, 5000);
    }
  };
  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <FormControl
            onKeyDown={handleKeyDown}
            as="textarea"
            value={content}
            onChange={handleChange}
            aria-label="With textarea"
          />
        </InputGroup>
      </Form>
      {!(percentage === 0 || percentage === 100) && (
        <ProgressBar
          variant="warning"
          label={`${percentage}%`}
          now={percentage}
        />
      )}
      {/* <ProgressBar
        variant="warning"
        label={`${percentage}%`}
        now={percentage}
      /> */}
      <div>
        {errors.map((errorMsg) => (
          <p key={errorMsg} style={{ color: "red" }}>
            {errorMsg}
          </p>
        ))}
      </div>
      <Row>
        <Col>
          <button
            onClick={handleSubmit}
            className="message-form-button"
            style={{ width: "100%" }}
            disabled={loading ? true : false}
          >
            SEND
          </button>
        </Col>
        <Col>
          <button
            onClick={handleOpenRef}
            className="message-form-button"
            style={{ width: "100%" }}
            disabled={loading ? true : false}
          >
            UPLOAD
          </button>
        </Col>
      </Row>
      <input
        accept="image/jpeg,image/png"
        type="file"
        style={{ display: "none" }}
        onChange={handleUploadImage}
        ref={inputOpenImageRef}
      ></input>
    </div>
  );
}

export default MessageForm;
