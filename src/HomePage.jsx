import React, { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";
import { db } from "./firebaseConfig"; // Importe o Firestore
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

function HomePage({ user }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Carregar postagens do Firestore
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsArray);
      setLoadingPosts(false);
    });

    return unsubscribe; // Desinscreve quando o componente desmontar
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      try {
        // Adiciona a nova postagem no Firestore
        await addDoc(collection(db, "posts"), {
          name: user.displayName,
          content: newPost,
          timestamp: serverTimestamp(),
          userId: user.uid,
          userPhoto: user.photoURL,
        });
        setNewPost("");
      } catch (error) {
        console.error("Erro ao adicionar postagem:", error);
        alert("Erro ao publicar: " + error.message);
      }
    }
  };

  // Função para navegar para a aba específica no perfil
  const navigateToProfileTab = (tab) => {
    navigate(`/profile#${tab}`);
  };

  return (
    <div className="home-page">
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="logo">Minha Rede Social</div>

        <div className="search-container">
          <input type="text" placeholder="Pesquisar..." />
          <button>
            <i className="search-icon">🔍</i>
          </button>
        </div>

        <div className="user-menu">
          {/* Área do usuário clicável para perfil */}
          <div
            className="user-info"
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
          >
            <img src={user.photoURL} alt={user.displayName} />
            <span>{user.displayName}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Card do usuário clicável para perfil */}
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
              <li
                className={location.pathname === "/" ? "active" : ""}
                onClick={() => navigate("/")}
              >
                <i className="icon">🏠</i> Feed
              </li>
              <li onClick={() => navigate("/profile")}>
                <i className="icon">👤</i> Perfil
              </li>
              {/* Botões para abas específicas do perfil */}
              <li onClick={() => navigateToProfileTab("friends")}>
                <i className="icon">👥</i> Amigos
              </li>
              <li onClick={() => navigateToProfileTab("photos")}>
                <i className="icon">📷</i> Fotos
              </li>
              <li onClick={() => navigate("/chat")}>
                <i className="icon">💬</i> Chat
              </li>
              <li>
                <i className="icon">🎬</i> Vídeos
              </li>
              <li>
                <i className="icon">📅</i> Eventos
              </li>
              <li>
                <i className="icon">🛒</i> Marketplace
              </li>
            </ul>
          </nav>
        </aside>

        {/* Área principal */}
        <main className="feed">
          {/* Criar nova postagem */}
          <div className="create-post">
            <div className="post-header">
              <img src={user.photoURL} alt={user.displayName} />
              <form onSubmit={handlePostSubmit}>
                <input
                  type="text"
                  placeholder="O que você está pensando?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
              </form>
            </div>
            <div className="post-actions">
              <button>
                <i>📷</i> Foto
              </button>
              <button>
                <i>🎬</i> Vídeo
              </button>
              <button>
                <i>📅</i> Evento
              </button>
              <button type="submit" onClick={handlePostSubmit}>
                Publicar
              </button>
            </div>
          </div>

          {/* Lista de postagens */}
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header">
                <img
                  src={`https://i.pravatar.cc/40?img=${post.id}`}
                  alt={post.name}
                />
                <div>
                  <h3>{post.name}</h3>
                  <p>{post.time}</p>
                </div>
              </div>
              <div className="post-content">{post.content}</div>
              <div className="post-actions">
                <button>
                  <i>👍</i> Curtir
                </button>
                <button>
                  <i>💬</i> Comentar
                </button>
                <button>
                  <i>↪️</i> Compartilhar
                </button>
              </div>
            </div>
          ))}
        </main>

        {/* Sidebar direita */}
        <aside className="right-sidebar">
          <div className="section">
            <h3>Aniversários</h3>
            <p>
              Hoje é aniversário de <strong>Mariana Costa</strong> e{" "}
              <strong>Lucas Oliveira</strong>
            </p>
          </div>

          <div className="section">
            <h3>Contatos</h3>
            <ul className="contacts">
              <li>
                <img src="https://i.pravatar.cc/30?img=1" alt="Amigo" />
                <span>Carlos Oliveira</span>
              </li>
              <li>
                <img src="https://i.pravatar.cc/30?img=2" alt="Amigo" />
                <span>Ana Costa</span>
              </li>
              <li>
                <img src="https://i.pravatar.cc/30?img=3" alt="Amigo" />
                <span>Pedro Santos</span>
              </li>
              <li>
                <img src="https://i.pravatar.cc/30?img=4" alt="Amigo" />
                <span>Mariana Costa</span>
              </li>
              <li>
                <img src="https://i.pravatar.cc/30?img=5" alt="Amigo" />
                <span>Lucas Oliveira</span>
              </li>
            </ul>
          </div>

          <div className="section">
            <h3>Eventos</h3>
            <div className="event">
              <div className="event-date">
                <span>28</span>
                <span>SET</span>
              </div>
              <div>
                <p>Conferência de Tecnologia</p>
                <small>São Paulo, SP</small>
              </div>
            </div>
            <div className="event">
              <div className="event-date">
                <span>05</span>
                <span>OUT</span>
              </div>
              <div>
                <p>Workshop de React</p>
                <small>Online</small>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HomePage;
