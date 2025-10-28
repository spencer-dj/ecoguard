// UserManagement.js
import React, { useEffect, useState } from "react";
import "./UserManagement.css";
import { getUsers, deleteUser, updateUser } from "../endpoint/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [action, setAction] = useState("");
  const [editingUser, setEditingUser] = useState(null); // For modal
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "User",
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  // Filter users by search query
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle checkbox select
  const handleCheckboxChange = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Handle bulk action
  const handleAction = async () => {
    if (action === "delete" && selectedUsers.length > 0) {
      try {
        for (const id of selectedUsers) {
          await deleteUser(id);
        }
        setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
    setAction("");
  };

  // Open edit modal
  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setFormData({
      username: user.username || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      role: user.role || "User",
    });
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      const updated = await updateUser(editingUser, formData);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser ? { ...u, ...updated } : u))
      );
      setEditingUser(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="user-management-container">
      <h2>User Management</h2>

      {/* Search + Action */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Bulk Actions</option>
          <option value="delete">Delete selected users</option>
        </select>
        <button onClick={handleAction}>Apply</button>
      </div>

      {/* Users Table */}
      <table className="user-table">
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>
                <button
                  className="link-button"
                  onClick={() => handleEditClick(user)}
                >
                  {user.username}
                </button>
              </td>
              <td>{user.email}</td>
              <td>{user.first_name || "-"}</td>
              <td>{user.last_name || "-"}</td>
              <td>{user.role && user.role !== "" ? user.role : "User"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit User</h3>
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </label>
            <label>
              First Name:
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </label>
            <label>
              Last Name:
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </label>
            <label>
              Role:
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="User">User</option>
                <option value="Ranger">Ranger</option>
                <option value="Admin">Admin</option>
              </select>
            </label>

            <div className="modal-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
