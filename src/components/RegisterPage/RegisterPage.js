import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import md5 from "md5";
import firebase from "../../firebase";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  // } = useForm();
  const [errorFormSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);

  const password = useRef();
  password.current = watch("password");
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let createdUser = await firebase
        .auth()
        .createUserWithEmailAndPassword(data.email, data.password);
      // console.log("createdUser", createdUser);

      await createdUser.user.updateProfile({
        displayName: data.name,
        photoURL: `http://gravatar.com/avatar/${md5(
          createdUser.user.email
        )}?d=identicon`,
      });

      //Firebase 데이터베이스에 저장해주기
      await firebase.database().ref("users").child(createdUser.user.uid).set({
        name: createdUser.user.displayName,
        image: createdUser.user.photoURL,
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErrorFromSubmit(error.message);
      console.log("error", error);
      setTimeout(() => {
        setErrorFromSubmit("");
      }, 3000);
    }
  };

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <div className="auth-wrapper">
      <div style={{ textAlign: "center" }}>
        <h3>REGISTER</h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* register your input into the hook by invoking the "register" function */}
        <label>email</label>
        <input
          defaultValue="email"
          name="email"
          type="email"
          {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
        />
        {errors.email && <span>This email field is required</span>}
        <label>name</label>
        <input
          name="name"
          {...register("name", { required: true, maxLength: 10 })}
        />
        {errors.name && errors.name.type === "required" && (
          <span>This name field is required</span>
        )}
        {errors.name && errors.name.type === "maxLength" && (
          <span>maxLength는 10보다 작아야 합니다.</span>
        )}
        <label>password</label>
        <input
          name="password"
          type="password"
          {...register("password", { required: true, minLength: 6 })}
        />
        {errors.password && errors.password.type === "required" && (
          <span>This password field is required</span>
        )}
        {errors.password && errors.password.type === "minLength" && (
          <span>minLengthh는 6보다 커야 합니다.</span>
        )}
        <label>password_confirm</label>
        <input
          name="password_confirm"
          type="password"
          {...register("password_confirm", {
            required: true,
            validate: (value) => value === password.current,
          })}
        />
        {errors.password_confirm &&
          errors.password_confirm.type === "required" && (
            <span>This password_confirm field is required</span>
          )}
        {errors.password_confirm &&
          errors.password_confirm.type === "validate" && (
            <span>비밀번호와 같아야 합니다.</span>
          )}
        {errorFormSubmit && <p>{errorFormSubmit}</p>}
        <input disabled={loading} type="submit" />
      </form>
      <Link
        style={{
          textAlign: "center",
          color: "gray",
          textDecoration: "none",
        }}
        to="/login"
      >
        이미 아이디가 있다면..
      </Link>
    </div>
  );
}

export default RegisterPage;
