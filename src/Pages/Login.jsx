import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [values, setValues] = useState({});
  const [redirect, setRedirect] = useState(false);

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (localStorage.getItem("chat-user")) {
      return setRedirect(true);
    }

    if (!localStorage.getItem("chat-user")) {
      return setRedirect(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const toastOpt = {
        position: "top-right",
        autoClose: 5000,
        pauseOnOver: true,
        draggable: true,
        icon: "⚡",
      };

      const { email, password } = values;

      // If email value is empty
      if (email === "") {
        toast.error("Email must be provided!", toastOpt);
        return;
      }

      //  POST REQUEST TO API
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.status === false) {
        return toast.error(data.msg, toastOpt);
      }

      if (data.status === true) {
        localStorage.setItem("chat-user", JSON.stringify(data.user));
        setRedirect(true);
      }
    } catch (error) {
      if (error) throw error;
    }
  };

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="container">
      <form action="POST" onSubmit={handleSubmit} className="form">
        <h1>Janerm Chatting App</h1>
        <input
          type="email"
          name="email"
          placeholder="Email..."
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <label>Password must have at least 8 or more characters</label>
        <button type="submit">Sign In</button>
        <span>
          You haven't register? <Link to={"/register"}>Register</Link>
        </span>
      </form>

      <ToastContainer />
    </div>
  );
}
