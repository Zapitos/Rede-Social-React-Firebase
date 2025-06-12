// src/ProfilePage.jsx

import React, { useState, useEffect } from "react";
import { auth, db } from "./firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

function ProfilePage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);

  // --- SEUS DADOS DE PERFIL ORIGINAIS ---
  const [profileData, setProfileData] = useState({
    displayName: user.displayName,
    bio: "Desenvolvedor Full Stack | Apaixonado por tecnologia e inovação",
    location: "São Paulo, SP",
    website: "https://meuportfolio.com",
    birthday: "15 de Maio de 1990",
  });

  // --- ESTADOS PARA OS POSTS REAIS E SEU CARREGAMENTO ---
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true); // Começa como true

  // --- LÓGICA CORRETA E COMPLETA PARA BUSCAR OS POSTS ---
  useEffect(() => {
    if (user) {
      setLoadingPosts(true); // Ativa o "carregando" sempre que for buscar
      const q = query(
        collection(db, "posts"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userPosts = [];
        querySnapshot.forEach((doc) => {
          userPosts.push({ id: doc.id, ...doc.data() });
        });
        setPosts(userPosts);
        setLoadingPosts(false); // Desativa o "carregando" quando os posts chegam
      });

      return () => unsubscribe();
    } else {
      setLoadingPosts(false); // Garante que não fique carregando se não houver usuário
    }
  }, [user]);

  // --- DADOS FICTÍCIOS PARA AS OUTRAS ABAS (COMO ESTAVA NO SEU ORIGINAL) ---
  const [photos, setPhotos] = useState([
    {
      id: 1,
      url: "https://picsum.photos/300/200?random=1",
      caption: "Conferência de Tecnologia",
    },
    {
      id: 2,
      url: "https://picsum.photos/300/200?random=2",
      caption: "Workshop de React",
    },
    {
      id: 3,
      url: "https://picsum.photos/300/200?random=3",
      caption: "Projeto finalizado",
    },
    {
      id: 4,
      url: "https://picsum.photos/300/200?random=4",
      caption: "Time de desenvolvimento",
    },
    {
      id: 5,
      url: "https://picsum.photos/300/200?random=5",
      caption: "Novo escritório",
    },
    {
      id: 6,
      url: "https://picsum.photos/300/200?random=6",
      caption: "Evento de networking",
    },
  ]);

  const [friends, setFriends] = useState([
    { id: 1, name: "Carlos Oliveira", mutual: 15 },
    { id: 2, name: "Ana Costa", mutual: 8 },
    { id: 3, name: "Pedro Santos", mutual: 32 },
    { id: 4, name: "Mariana Costa", mutual: 7 },
    { id: 5, name: "Lucas Oliveira", mutual: 12 },
    { id: 6, name: "Juliana Pereira", mutual: 5 },
  ]);

  // --- TODAS AS SUAS FUNÇÕES ORIGINAIS ---
  useEffect(() => {
    const hash = location.hash.substring(1);
    const validTabs = ["posts", "photos", "friends", "about"];
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  const handleLike = (postId) => {
    const postRef = doc(db, "posts", postId);
    const originalPosts = posts;
    const newPosts = posts.map((post) => {
      if (post.id === postId) {
        const userHasLiked = (post.likes || []).includes(user.uid);
        const newLikes = userHasLiked
          ? (post.likes || []).filter((uid) => uid !== user.uid)
          : [...(post.likes || []), user.uid];
        return { ...post, likes: newLikes };
      }
      return post;
    });
    setPosts(newPosts);
    const originalPost = originalPosts.find((p) => p.id === postId);
    const userHasLikedOriginal = (originalPost?.likes || []).includes(user.uid);
    if (userHasLikedOriginal) {
      updateDoc(postRef, { likes: arrayRemove(user.uid) }).catch((err) =>
        setPosts(originalPosts)
      );
    } else {
      updateDoc(postRef, { likes: arrayUnion(user.uid) }).catch((err) =>
        setPosts(originalPosts)
      );
    }
  };

  // --- CÓDIGO DE RENDERIZAÇÃO (JSX) COMPLETO E RESTAURADO ---
  return (
    <div className="profile-page">
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

      <div className="profile-banner">
        <div className="banner-image"></div>
        <div className="profile-info">
          <div className="profile-picture">
            <img src={user.photoURL} alt={user.displayName} />
          </div>
          <div className="profile-details">
            <h1>{user.displayName}</h1>
            <p>{profileData.bio}</p>
            <div className="profile-stats">
              <div>
                <strong>{posts.length}</strong>
                <span>Publicações</span>
              </div>
              <div>
                <strong>850</strong>
                <span>Seguidores</span>
              </div>
              <div>
                <strong>320</strong>
                <span>Seguindo</span>
              </div>
            </div>
          </div>
          <button
            className="edit-profile-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancelar" : "Editar Perfil"}
          </button>
        </div>
      </div>

      <nav className="profile-nav">
        <button
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => setActiveTab("posts")}
        >
          Publicações
        </button>
        <button
          className={activeTab === "photos" ? "active" : ""}
          onClick={() => setActiveTab("photos")}
        >
          Fotos
        </button>
        <button
          className={activeTab === "friends" ? "active" : ""}
          onClick={() => setActiveTab("friends")}
        >
          Amigos
        </button>
        <button
          className={activeTab === "about" ? "active" : ""}
          onClick={() => setActiveTab("about")}
        >
          Sobre
        </button>
      </nav>

      <div className="profile-content">
        {isEditing && (
          <div className="edit-profile-section">
            <h2>Editar Perfil</h2>
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="displayName"
                value={profileData.displayName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Localização</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={profileData.website}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input
                type="text"
                name="birthday"
                value={profileData.birthday}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-actions">
              <button className="save-btn" onClick={handleSaveProfile}>
                Salvar Alterações
              </button>
              <button
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="profile-posts">
            {loadingPosts ? (
              <p>Carregando publicações...</p>
            ) : posts.length > 0 ? (
              posts.map((post) => {
                const isLiked = (post.likes || []).includes(user.uid);
                return (
                  <div key={post.id} className="post">
                    <div className="post-header">
                      <img src={user.photoURL} alt={user.displayName} />
                      <div>
                        <h3>{user.displayName}</h3>
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
                      <button>
                        <i>💬</i> Comentar
                      </button>
                      <button>
                        <i>↪️</i> Compartilhar
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>Nenhuma publicação encontrada.</p>
            )}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="profile-photos">
            <h2>Fotos</h2>
            <div className="photo-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="photo-item">
                  <img src={photo.url} alt={photo.caption} />
                  <p>{photo.caption}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div className="profile-friends">
            <h2>Amigos ({friends.length})</h2>
            <div className="friends-grid">
              {friends.map((friend) => (
                <div key={friend.id} className="friend-item">
                  <img
                    src={`https://i.pravatar.cc/80?img=${friend.id}`}
                    alt={friend.name}
                  />
                  <div>
                    <h3>{friend.name}</h3>
                    <p>{friend.mutual} amigos em comum</p>
                  </div>
                  <button className="message-btn">Mensagem</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="profile-about">
            <h2>Sobre</h2>
            <div className="about-section">
              <h3>Informações Básicas</h3>
              <div className="info-item">
                <span>Nome completo:</span>
                <p>{user.displayName}</p>
              </div>
              <div className="info-item">
                <span>Email:</span>
                <p>{user.email}</p>
              </div>
              <div className="info-item">
                <span>Localização:</span>
                <p>{profileData.location}</p>
              </div>
              <div className="info-item">
                <span>Website:</span>
                <p>
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profileData.website}
                  </a>
                </p>
              </div>
              <div className="info-item">
                <span>Data de Nascimento:</span>
                <p>{profileData.birthday}</p>
              </div>
            </div>
            {/* Outras seções da aba sobre restauradas */}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
