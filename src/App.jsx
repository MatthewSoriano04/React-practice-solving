import { useState, useEffect } from "react";
import "./App.css";

function App() {

  // -----Use States-----
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  function searchUser(users) {
    
  }

  useEffect(() => async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await response.json();
    setUsers(data);
    console.log(data);
  },[]);

  return (
    <div>
      <table border="1">
        <thead>
          <tr>
            <td colSpan="3">
              Search <input></input>
            </td>
          </tr>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
          <tr key={users.id}>
            <td>{user.name}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
          </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;