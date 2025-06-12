// src/HomePage.jsx

import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
  getDocs,
} from "firebase/firestore";

function HomePage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Estados para os Comentários
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const commentUnsubscribe = useRef(null);

  // Efeito para buscar os posts e uma prévia dos comentários
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // setLoadingPosts(true); // <-- ESTA LINHA FOI REMOVIDA
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() });
      });

      const postsWithPreviewComments = await Promise.all(
        postsArray.map(async (post) => {
          const commentsQuery = query(
            collection(db, "posts", post.id, "comments"),
            orderBy("timestamp", "desc"),
            limit(2)
          );

          const commentsSnapshot = await getDocs(commentsQuery);
          const previewComments = [];
          commentsSnapshot.forEach((doc) => {
            previewComments.push({ id: doc.id, ...doc.data() });
          });

          return { ...post, previewComments: previewComments.reverse() };
        })
      );

      setPosts(postsWithPreviewComments);
      setLoadingPosts(false); // Esta linha agora só afeta o carregamento inicial
    });

    return () => unsubscribe();
  }, []);

  // --- Funções de Lógica (sem alterações) ---
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
        await addDoc(collection(db, "posts"), {
          name: user.displayName,
          content: newPost,
          timestamp: serverTimestamp(),
          userId: user.uid,
          userPhoto: user.photoURL,
          likes: [],
        });
        setNewPost("");
      } catch (error) {
        console.error("Erro ao adicionar postagem:", error);
      }
    }
  };
  const handleLike = (postId) => {
    const userId = user.uid;
    const originalPosts = posts;
    const newPosts = posts.map((post) => {
      if (post.id === postId) {
        const userHasLiked = (post.likes || []).includes(userId);
        let newLikes = userHasLiked
          ? (post.likes || []).filter((uid) => uid !== userId)
          : [...(post.likes || []), userId];
        return { ...post, likes: newLikes };
      }
      return post;
    });
    setPosts(newPosts);
    const postRef = doc(db, "posts", postId);
    const originalPost = originalPosts.find((p) => p.id === postId);
    const userHasLikedOriginal = (originalPost?.likes || []).includes(userId);
    if (userHasLikedOriginal) {
      updateDoc(postRef, { likes: arrayRemove(userId) }).catch((err) => {
        setPosts(originalPosts);
      });
    } else {
      updateDoc(postRef, { likes: arrayUnion(userId) }).catch((err) => {
        setPosts(originalPosts);
      });
    }
  };
  const toggleCommentBox = (postId) => {
    if (commentUnsubscribe.current) {
      commentUnsubscribe.current();
    }
    if (activeCommentBox === postId) {
      setActiveCommentBox(null);
      setComments([]);
    } else {
      setActiveCommentBox(postId);
      setLoadingComments(true);
      const commentsQuery = query(
        collection(db, "posts", postId, "comments"),
        orderBy("timestamp", "asc")
      );
      commentUnsubscribe.current = onSnapshot(commentsQuery, (snapshot) => {
        const fetchedComments = [];
        snapshot.forEach((doc) => {
          fetchedComments.push({ id: doc.id, ...doc.data() });
        });
        setComments(fetchedComments);
        setLoadingComments(false);
      });
    }
  };
  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (commentText.trim() === "") return;
    await addDoc(collection(db, "posts", postId, "comments"), {
      text: commentText,
      userName: user.displayName,
      userPhotoURL: user.photoURL,
      userId: user.uid,
      timestamp: serverTimestamp(),
    });
    setCommentText("");
  };
  const navigateToProfileTab = (tab) => {
    navigate(`/profile#${tab}`);
  };

  return (
    <div className="home-page">
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
        <aside className="sidebar">
          <div className="user-card" onClick={() => navigate("/profile")}>
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
              <li onClick={() => navigateToProfileTab("friends")}>
                <i className="icon">👥</i> Amigos
              </li>
              <li onClick={() => navigateToProfileTab("photos")}>
                <i className="icon">📷</i> Fotos
              </li>
              <li onClick={() => navigate("/chat")}>
                <i className="icon">💬</i> Chat
              </li>
            </ul>
          </nav>
        </aside>

        <main className="feed">
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

          {loadingPosts ? (
            <p
              style={{
                textAlign: "center",
                padding: "20px",
                color: "var(--text-light)",
              }}
            >
              Carregando feed...
            </p>
          ) : (
            posts.map((post) => {
              const isLiked = (post.likes || []).includes(user.uid);
              return (
                <div key={post.id} className="post">
                  <div className="post-header">
                    <img
                      src={post.userPhoto || "https://i.pravatar.cc/40"}
                      alt={post.name}
                    />
                    <div>
                      <h3>{post.name}</h3>
                      <p>{post.timestamp?.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="post-content">{post.content}</div>

                  <div className="post-actions">
                    <button
                      onClick={() => handleLike(post.id)}
                      style={{
                        color: isLiked ? "var(--primary)" : "inherit",
                        fontWeight: isLiked ? "bold" : "normal",
                      }}
                    >
                      <i>👍</i> {isLiked ? "Curtido" : "Curtir"} (
                      {(post.likes || []).length})
                    </button>
                    <button onClick={() => toggleCommentBox(post.id)}>
                      <i>💬</i> Comentar
                    </button>
                    <button>
                      <i>↪️</i> Compartilhar
                    </button>
                  </div>

                  {activeCommentBox !== post.id && (
                    <div className="comment-preview-list">
                      {(post.previewComments || []).map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <img
                            src={comment.userPhotoURL}
                            alt={comment.userName}
                          />
                          <div className="comment-content">
                            <strong>{comment.userName}</strong>
                            <p>{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeCommentBox === post.id && (
                    <div className="comment-section">
                      <div className="comment-list">
                        {loadingComments && <p>Carregando comentários...</p>}
                        {!loadingComments &&
                          comments.map((comment) => (
                            <div key={comment.id} className="comment-item">
                              <img
                                src={comment.userPhotoURL}
                                alt={comment.userName}
                              />
                              <div className="comment-content">
                                <strong>{comment.userName}</strong>
                                <p>{comment.text}</p>
                              </div>
                            </div>
                          ))}
                        {!loadingComments && comments.length === 0 && (
                          <p>Nenhum comentário ainda. Seja o primeiro!</p>
                        )}
                      </div>
                      <form
                        className="comment-form"
                        onSubmit={(e) => handleCommentSubmit(e, post.id)}
                      >
                        <img src={user.photoURL} alt="Sua foto" />
                        <input
                          type="text"
                          placeholder="Escreva um comentário..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          autoFocus
                        />
                        <button type="submit">Publicar</button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </main>

        <aside className="right-sidebar">
          <div className="section">
            <h3>Aniversários</h3>
            <p>
              Hoje é aniversário de <strong>Mariana Costa</strong>
            </p>
          </div>
          <div className="section">
            <h3>Contatos</h3>
            {/* ... */}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HomePage;
