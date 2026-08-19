import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/users";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    userName: "",
    email: "",
    role: "USER"
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Unable to connect to the User API.");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the User API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  const resetForm = () => {
    setNewUser({ userName: "", email: "", role: "USER" });
    setEditingUserId(null);
    setShowForm(false);
  };

  const handleSubmitUser = async (event) => {
    event.preventDefault();
    try {
      const isEditing = editingUserId !== null;
      const url = isEditing ? `${API_URL}/${editingUserId}` : API_URL;
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing ? { userId: editingUserId, ...newUser } : newUser;

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(isEditing ? "Unable to update user." : "Unable to create user.");
      }

      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) return;
    try {
      const response = await fetch(`${API_URL}/${userId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete user.");
      await fetchUsers();
    } catch (error) {
      alert("Unable to delete user.");
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.userId);
    setNewUser({
      userName: user.userName,
      email: user.email,
      role: user.role
    });
    setShowForm(true);
  };

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();
    return (
        user.userName.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.userId.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText)
    );
  });

  return (
      <div className="app">
        <nav className="navbar">
          <div className="brand">
            <div className="logo-icon">⚔</div>
            <div>
              <h1>Anime<span>Store</span></h1>
              <p>アニメストア</p>
            </div>
          </div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#products">Products</a>
            <a href="#categories">Categories</a>
            <a href="#users" className="active">Users</a>
          </div>
          <div className="nav-icons">
            <span>🛒</span>
            <span>👤</span>
          </div>
        </nav>

        {showForm && (
            <div className="modal-overlay">
              <div className="user-modal">
                <div className="modal-header">
                  <div>
                    <p className="section-label">ANIME STORE</p>
                    <h2>{editingUserId ? "Edit User" : "Create New User"}</h2>
                  </div>
                  <button className="close-button" onClick={resetForm}>×</button>
                </div>
                <form onSubmit={handleSubmitUser}>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        name="userName"
                        placeholder="Enter username"
                        value={newUser.userName}
                        onChange={handleChange}
                        required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={newUser.email}
                        onChange={handleChange}
                        required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={newUser.role} onChange={handleChange}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-button" onClick={resetForm}>Cancel</button>
                    <button type="submit" className="primary-button">
                      {editingUserId ? "Update User" : "Create User"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        <main>
          <section className="hero" id="home">
            <div className="hero-content">
              <p className="welcome">WELCOME TO</p>
              <h2>Your Ultimate <span> Anime Store</span></h2>
              <p className="hero-text">Discover anime merchandise, manga, collectibles and more.</p>
              <button className="primary-button" onClick={() => document.getElementById("users").scrollIntoView({ behavior: "smooth" })}>
                Manage Users
              </button>
            </div>
            <div className="hero-art">
              <div className="circle">
                <div className="anime-symbol">⚔</div>
                <div className="cart-symbol">🛒</div>
              </div>
            </div>
          </section>

          <section className="dashboard" id="users">
            <div className="section-header">
              <div>
                <p className="section-label">ADMIN DASHBOARD</p>
                <h2>User Management</h2>
                <p>Manage AnimeStore users from one place.</p>
              </div>
              <button className="add-button" onClick={() => setShowForm(true)}>+ Add User</button>
            </div>

            <div className="stats">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div>
                  <p>Total Users</p>
                  <h3>{users.length}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div>
                  <p>Regular Users</p>
                  <h3>{users.filter((user) => user.role === "USER").length}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛡️</div>
                <div>
                  <p>Administrators</p>
                  <h3>{users.filter((user) => user.role === "ADMIN").length}</h3>
                </div>
              </div>
            </div>

            <div className="users-card">
              <div className="table-header">
                <div>
                  <h3>All Users</h3>
                  <p>View and manage registered users.</p>
                </div>
                <div className="search-box">
                  <span>🔍</span>
                  <input
                      type="text"
                      placeholder="Search users..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              {loading && <div className="message">Loading users...</div>}
              {error && <div className="message error-message">{error}</div>}

              {!loading && !error && (
                  <div className="table-container">
                    <table>
                      <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                              <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>
                                  <div className="user-name">
                                    <div className="avatar">{user.userName.charAt(0).toUpperCase()}</div>
                                    {user.userName}
                                  </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                                        <span className={user.role === "ADMIN" ? "role admin" : "role user"}>
                                                            {user.role}
                                                        </span>
                                </td>
                                <td>
                                  <div className="actions">
                                    <button className="edit-button" onClick={() => handleEditClick(user)}>Edit</button>
                                    <button className="delete-button" onClick={() => handleDeleteUser(user.userId)}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan="5" className="empty">No users found.</td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
          </section>
        </main>

        <footer>
          <h3>Anime<span>Store</span></h3>
          <p>Anime • Manga • Collectibles • Gaming</p>
          <p className="copyright">© 2026 AnimeStore | ADP3 Capstone Project</p>
        </footer>
      </div>
  );
}

export default App;