import { useEffect, useMemo, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { FiLogOut } from "react-icons/fi";
import {
  BsFillBrightnessHighFill,
  BsFillSendFill,
  BsFillEmojiSmileFill,
} from "react-icons/bs";
import Welcome from "../Components/Welcome";
import { MdDarkMode } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
// import { v4 as uuidv4 } from "uuid";

export default function Chat() {
  const [currentUser, setCurrentUser] = useState({});
  const [contacts, setContacts] = useState({});
  const [redirect, setRedirect] = useState(false);
  const [currentClickedUserIndex, setCurrentClickedUserIndex] = useState("");
  const [containerClickState, setContainerClickState] = useState(false);
  const [contactClicked, setContactClicked] = useState(false);
  const [bright, setBright] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [msg, setMsg] = useState("");
  const [chatMessage, setChatMessage] = useState([]);
  const scrollRef = useRef();
  // Connect Client and Server Socket
  const socket = useRef();
  const URL =
    process.env.REACT_APP_NODE_ENV === "production"
      ? undefined
      : "ws://localhost:4000";
  const [arriverMessage, setArriverMessage] = useState(null);

  // Socket
  useEffect(() => {
    socket.current = io(URL);
    socket.current.on("getMessage", (data) => {
      setArriverMessage({
        fromSelf: data.fromSelf,
        fromId: data.fromId,
        message: data.message,
      });
    });
  }, [URL]);

  useEffect(() => {
    if (arriverMessage) {
      setChatMessage((prev) => [...prev, arriverMessage]);
    }
  }, [arriverMessage]);

  useEffect(() => {
    if (currentUser) {
      socket.current.emit("addUser", currentUser.id);
      socket.current.on("onlineUsers", (users) => {
        // console.log(users);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const avatarProfile = useMemo(() => {
    return createAvatar(avataaars, {
      seed: "Aneka",
    }).toDataUriSync();
  }, []);

  // Fetch data from LS
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("chat-user"));

    if (!items) {
      return setRedirect(true);
    }

    if (items) {
      setCurrentUser(items);
    }
  }, []);

  useEffect(() => {
    if (!currentUser.id) return;

    fetch(`http://localhost:4000/users/${currentUser.id}`)
      .then((res) => res.json())

      // I wont forget this promise bug,whereas MENTOR JOESTACK help me out
      .then((data) =>
        setContacts((prevData) => {
          return {
            ...prevData,
            data,
          };
        })
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  const userProfile =
    currentUser.profile === undefined
      ? avatarProfile
      : `http://localhost:4000/${currentUser.profile}`;

  // Handler for contact clicked
  const handleCurrectChat = (i, contact) => {
    setCurrentClickedUserIndex(i);
    setContainerClickState(true);
    setContactClicked(contact);
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.setItem("chat-user", "");
    setRedirect(true);
  };

  const handleShowEmoji = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmoji = (emoji, e) => {
    let message = msg;
    message += emoji.emoji;
    setMsg(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't forget the headers when using 'fetch' Method
    const res = await fetch("http://localhost:4000/messages", {
      method: "POST",
      body: JSON.stringify({
        toId: contactClicked._id,
        fromId: currentUser.id,
        message: msg,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    setChatMessage([
      ...chatMessage,
      {
        fromSelf: true,
        message: data.data,
      },
    ]);

    setMsg("");

    socket.current.emit("sendMessage", {
      toId: contactClicked._id,
      fromId: currentUser.id,
      message: msg,
    });
  };

  // Scroll smoothly Into latest chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessage]);

  // Fetch All messages from DB
  useEffect(() => {
    if (contactClicked) {
      const fetchData = async () => {
        const res = await fetch("http://localhost:4000/allMessages", {
          method: "POST",
          body: JSON.stringify({
            toId: contactClicked._id,
            fromId: currentUser.id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const response = await res.json();

        setChatMessage(response);
      };
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactClicked]);

  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  if (redirect) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className={`chat-container ${bright === false ? "dark" : ""}`}>
      <div className="header">
        <div className="logo">
          <h1>Janerm</h1>
        </div>

        {containerClickState && (
          <div className="current-chat">
            <img
              src={`http://localhost:4000/${contactClicked.profile}`}
              alt="Header"
            />
            <label>{contactClicked.name}</label>
          </div>
        )}

        <div className="wishes">
          <div onClick={() => setBright(!bright)} className="bright">
            {bright ? <BsFillBrightnessHighFill /> : <MdDarkMode />}
          </div>

          <div className="logout" onClick={handleLogout}>
            <FiLogOut />
          </div>

          <div className="profile">
            {currentUser && <h4>{currentUser.username}</h4>}
            <div className="profile-image">
              <img src={userProfile} alt="profile" />
            </div>
          </div>
        </div>
      </div>
      <div className="main">
        <div className="contacts">
          {contacts.data === undefined
            ? "Loading...."
            : contacts.data.map((contact, i) => {
                return (
                  <div
                    onClick={() => handleCurrectChat(i, contact)}
                    className={`contact ${
                      i === currentClickedUserIndex ? "selected" : ""
                    }`}
                    key={i}
                  >
                    <img
                      src={`http://localhost:4000/${contact.profile}`}
                      alt="Contact-profile"
                    />
                    <p>{contact.name}</p>
                  </div>
                );
              })}
        </div>
        <div className="messages-page">
          <div className="messages">
            <div className="message">
              {!containerClickState ? (
                <Welcome name={currentUser.username} />
              ) : (
                <div>
                  {chatMessage.map((msg, i) => (
                    <div
                      ref={scrollRef}
                      key={i}
                      className={`${msg.fromSelf ? "sender" : "receiver"}`}
                    >
                      <p id="none"></p>
                      <p id="none"></p>
                      <p>{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="emoji-container">
                {showEmojiPicker && (
                  <EmojiPicker
                    autoFocusSearch={true}
                    Theme="dark"
                    emojiStyle="google"
                    suggestedEmojisMode="frequent"
                    onEmojiClick={handleEmoji}
                    width={300}
                    height={350}
                  />
                )}
              </div>

              <form className="fill-message" onSubmit={handleSubmit}>
                <div className="emoji" onClick={handleShowEmoji}>
                  <BsFillEmojiSmileFill />
                </div>
                <input
                  type="text"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Type your message here..."
                />
                <button type="submit">
                  <BsFillSendFill />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
