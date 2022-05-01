import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
// TODO: Replace with your app's Firebase project configuration
var firebaseConfig = {
  apiKey: "AIzaSyBrgacFyGIcj5H7qjjc_-lkqOBTfd675Zs",
  authDomain: "rc-chat-4aee7.firebaseapp.com",
  // The value of `databaseURL` depends on the location of the database
  databaseURL:
    "https://rc-chat-4aee7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rc-chat-4aee7",
  storageBucket: "rc-chat-4aee7.appspot.com",
  messagingSenderId: "996352433877",
  appId: "1:996352433877:web:6a39dd8895d8e599160c5c",
  measurementId: "G-D88B811YGV",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
