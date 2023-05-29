import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setRedirect] = useState(false);

  const toastOpt = {
    position: "top-right",
    autoClose: 5000,
    pauseOnOver: true,
    draggable: true,
    icon: "⚡",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If password are not equal
      if (password !== confirmPassword) {
        toast.error(
          "Password and Confirm Password must be the same!",
          toastOpt
        );

        return;
      }

      // If password length is less than 8
      if (password.length < 8) {
        toast.error(
          "Password length must be greater or equal to 8 characters!",
          toastOpt
        );

        return;
      }

      // If email value is empty
      if (email === "") {
        toast.error("Email must be provided!", toastOpt);
        return;
      }

      const data = new FormData();

      data.set("username", username);
      data.set("email", email);
      data.set("password", password);
      data.set("files", files[0]);

      //  POST REQUEST TO API
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const res = await response.json();

      if (res.status === false) {
        return toast.error(res.msg, toastOpt);
      }

      if (res.status === true) {
        setRedirect(true);
      }
    } catch (error) {
      if (error) throw error;
    }
  };

  if (redirect) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className="container">
      <form
        onSubmit={handleSubmit}
        className="form"
        encType="multipart/form-data"
        action="/register"
        method="POST"
      >
        <h1>Janerm Chatting App</h1>
        <input
          type="text"
          value={username}
          placeholder="Username..."
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          value={email}
          placeholder="Email..."
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Choose Your profile picture</label>
        <input type="file" onChange={(e) => setFiles(e.target.files)} />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          value={confirmPassword}
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Sign Up</button>
        <span>
          Already has and Account? <Link to={"/login"}>Login</Link>
        </span>
      </form>

      <ToastContainer />
    </div>
  );
}
