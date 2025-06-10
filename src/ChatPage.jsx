// src/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

function ChatPage({ user }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Carregar mensagens do Firestore
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesArray = [];
      querySnapshot.forEach((doc) => {
        messagesArray.push({ id: doc.id, ...doc.data() });
      });
      // Ordenar por timestamp crescente para exibir do mais antigo para o mais novo
      setMessages(messagesArray.reverse());
    });

    return unsubscribe;
  }, []);

  // Rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        timestamp: serverTimestamp(),
        userId: user.uid,
        name: user.displayName,
        photoURL: user.photoURL,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <div className="chat-page">
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="logo" onClick={() => navigate("/")}>
          Minha Rede Social
        </div>

        <div className="search-container">
          <input type="text" placeholder="Pesquisar..." />
          <button>
            <i className="search-icon">🔍</i>
          </button>
        </div>

        <div className="user-menu">
          <div className="user-info" onClick={() => navigate("/profile")}>
            <img src={user.photoURL} alt={user.displayName} />
            <span>{user.displayName}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar esquerda */}
        <aside className="sidebar">
          <div
            className="user-card"
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="profile-pic"
            />
            <h2>{user.displayName}</h2>
            <p>{user.email}</p>
          </div>

          <nav className="menu">
            <ul>
              <li onClick={() => navigate("/")}>
                <i className="icon">🏠</i> Feed
              </li>
              <li onClick={() => navigate("/profile")}>
                <i className="icon">👤</i> Perfil
              </li>
              <li className="active">
                <i className="icon">💬</i> Chat
              </li>
              <li onClick={() => navigate("/profile#friends")}>
                <i className="icon">👥</i> Amigos
              </li>
            </ul>
          </nav>
        </aside>

        {/* Área de chat */}
        <main className="chat-container">
          <div className="chat-header">
            <h2>Chat Geral</h2>
          </div>

          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.userId === user.uid ? "sent" : "received"
                }`}
              >
                {message.userId !== user.uid && (
                  <img
                    src={message.photoURL || "https://i.pravatar.cc/40"}
                    alt={message.name}
                  />
                )}
                <div className="message-content">
                  {message.userId !== user.uid && (
                    <span className="message-sender">{message.name}</span>
                  )}
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp
                      ?.toDate()
                      .toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite uma mensagem..."
            />
            <button type="submit">Enviar</button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default ChatPage;
