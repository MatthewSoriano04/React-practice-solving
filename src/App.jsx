import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // -----Use States-----
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const totalUsers = users.length;

  const searchUser = users.filter((user) => {
    const query = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  });

  const visibleUsers = searchUser.length;

  function deleteUser(user) {
    const updatedUsers = users.filter((userItem) => {
      return userItem.id !== user.id;
    })
    setUsers(updatedUsers);
  }


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) {
          throw new Error("Network response failed");
        }

        const data = await response.json();
        setUsers(data);
      }

      catch (error) {
        setError(error)

      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  },[]);

  if (loading) {
    return <h1>Loading...</h1>
  }

  if (error) {
    return <h1>{error.message}</h1>
  }

  return (
    <div>
      <table border="1">
        <thead>
          <tr>
            <td colSpan="4">
              Search <input type="text" value={search} onChange={(event) => {
                setSearch(event.target.value);
              }} />
            </td>
          </tr>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {searchUser.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>
              <button onClick={() => {
                setViewUser(user);
              }}>
              View Details
              </button>
              <button onClick={() => deleteUser(user)}>
                Delete
              </button>
            </td>
          </tr>
          ))}
          <tr>
            <td colSpan="4">
              {viewUser ? 
                (
                  <div>
                    <button onClick={() => setViewUser(null)}>Close</button>
                    <div>Name: {viewUser.name}</div>
                    <div>Username: {viewUser.username}</div>
                    <div>Email: {viewUser.email}</div>
                    <div>Company: {viewUser.company.name}</div>
                    <div>Website: <a href={viewUser.website}>{viewUser.website}</a></div>
                  </div>
                ) 
                : 
                ("Select a user to view details")
              }
            </td>
          </tr>
          <tr>
            <td colSpan="4">
              Total Users: {totalUsers} | Visible Users: {visibleUsers}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;