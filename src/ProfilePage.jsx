// src/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";

function ProfilePage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user.displayName,
    bio: "Desenvolvedor Full Stack | Apaixonado por tecnologia e inovação",
    location: "São Paulo, SP",
    website: "https://meuportfolio.com",
    birthday: "15 de Maio de 1990",
  });

  // Efeito para detectar a hash na URL e definir a aba ativa
  useEffect(() => {
    const hash = location.hash.substring(1); // Remove o '#'
    const validTabs = ["posts", "photos", "friends", "about"];

    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);

      // Rolar suavemente para o topo do conteúdo do perfil
      setTimeout(() => {
        const contentElement = document.querySelector(".profile-content");
        if (contentElement) {
          contentElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location]);

  // Dados fictícios para o perfil
  const [posts, setPosts] = useState([
    {
      id: 1,
      content: "Acabei de publicar meu novo artigo sobre React! 🚀",
      time: "2 min",
      likes: 15,
    },
    {
      id: 2,
      content:
        "Alguém para uma call hoje à tarde para discutir o novo projeto?",
      time: "15 min",
      likes: 8,
    },
    {
      id: 3,
      content: "Finalmente terminei meu curso de UI/UX Design! 🎉",
      time: "1 h",
      likes: 32,
    },
  ]);

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
    // Aqui você adicionaria a lógica para salvar no Firebase
  };

  return (
    <div className="profile-page">
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

      {/* Banner do perfil */}
      <div className="profile-banner">
        <div className="banner-image"></div>
        <div className="profile-info">
          <div className="profile-picture">
            <img src={user.photoURL} alt={user.displayName} />
            <button className="edit-photo-btn">✏️</button>
          </div>
          <div className="profile-details">
            <h1>{user.displayName}</h1>
            <p>{profileData.bio}</p>
            <div className="profile-stats">
              <div>
                <strong>120</strong>
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

      {/* Menu de navegação do perfil */}
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

      {/* Conteúdo principal do perfil */}
      <div className="profile-content">
        {/* Seção de edição de perfil */}
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

        {/* Seção de posts */}
        {activeTab === "posts" && (
          <div className="profile-posts">
            {posts.map((post) => (
              <div key={post.id} className="post">
                <div className="post-header">
                  <img src={user.photoURL} alt={user.displayName} />
                  <div>
                    <h3>{user.displayName}</h3>
                    <p>{post.time}</p>
                  </div>
                </div>
                <div className="post-content">{post.content}</div>
                <div className="post-actions">
                  <button>
                    <i>👍</i> Curtir ({post.likes})
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
          </div>
        )}

        {/* Seção de fotos */}
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

        {/* Seção de amigos */}
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

        {/* Seção sobre */}
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

            <div className="about-section">
              <h3>Biografia</h3>
              <p>{profileData.bio}</p>
            </div>

            <div className="about-section">
              <h3>Experiência Profissional</h3>
              <div className="experience-item">
                <div className="exp-logo">
                  <div>TS</div>
                </div>
                <div className="exp-details">
                  <h4>Tech Solutions Ltda</h4>
                  <p>Desenvolvedor Sênior</p>
                  <p>2015 - Atualmente</p>
                  <p>Desenvolvimento de sistemas web com React e Node.js</p>
                </div>
              </div>
              <div className="experience-item">
                <div className="exp-logo">
                  <div>ID</div>
                </div>
                <div className="exp-details">
                  <h4>Inova Digital</h4>
                  <p>Desenvolvedor Front-end</p>
                  <p>2013 - 2015</p>
                  <p>Criação de interfaces responsivas e otimizadas</p>
                </div>
              </div>
            </div>

            <div className="about-section">
              <h3>Educação</h3>
              <div className="education-item">
                <div className="edu-logo">
                  <div>UF</div>
                </div>
                <div className="edu-details">
                  <h4>Universidade Federal</h4>
                  <p>Bacharelado em Ciência da Computação</p>
                  <p>2009 - 2013</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
