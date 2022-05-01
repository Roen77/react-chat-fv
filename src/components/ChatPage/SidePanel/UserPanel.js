import React, { useRef } from "react";
import { IoIosChatboxes } from "react-icons/io";
import Dropdown from "react-bootstrap/Dropdown";
import Image from "react-bootstrap/Image";
import { useSelector, useDispatch } from "react-redux";
import firebase from "../../../firebase";
import extName from "ext-name";
import { setPhotoURL } from "../../../redux/actions/user_action";
function UserPanel() {
  const inputOpenImageRef = useRef();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);
  const handleOpenImageRef = () => {
    inputOpenImageRef.current.click();
  };
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    console.log(extName(file.name)[0]?.mime);
    const filetype = extName(file.name)[0]?.mime;
    if (!filetype) return;
    const metadata = { contentType: filetype };
    try {
      let uploadTaskSnapshot = await firebase
        .storage()
        .ref()
        .child(`user_image/${user.uid}`)
        .put(file, metadata);

      let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();
      // 프로필 이미지 수정
      await firebase.auth().currentUser.updateProfile({
        photoURL: downloadURL,
      });
      // console.log("url", downloadURL);
      dispatch(setPhotoURL(downloadURL));

      // db 유저 이미지 수정
      await firebase
        .database()
        .ref("users")
        .child(user.uid)
        .update({ image: downloadURL });

      // console.log(uploadTaskSnapshot, ":upload");
    } catch (error) {
      alert(error);
    }
  };
  const handleLogout = () => {
    firebase.auth().signOut();
  };
  return (
    <div>
      {/* Logo */}
      <h3 style={{ color: "white" }}>
        <IoIosChatboxes /> Chat App
      </h3>
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <Image
          src={user && user.photoURL}
          style={{ width: "30px", height: "30px", marginTop: "3px" }}
          roundedCircle
        />
        <Dropdown>
          <Dropdown.Toggle
            style={{ background: "transparent", border: "0px" }}
            id="dropdown-basic"
          >
            {user && user.displayName}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={handleOpenImageRef}>
              프로필 사진 변경
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>로그아웃</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <input
          type="file"
          ref={inputOpenImageRef}
          onChange={handleUploadImage}
          accept="image/jpeg, image/png"
          style={{ display: "none" }}
        ></input>
      </div>
    </div>
  );
}

export default UserPanel;
