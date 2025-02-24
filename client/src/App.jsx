import { useEffect, useState } from "react";
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import XLSX for file parsing
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]); // State for selected movies
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ movie_name: "", description: "", casting: "" });
  const [excelFile, setExcelFile] = useState(null); // State to store the uploaded Excel file

  // Get function
  const getAllUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      setUsers(res.data);
      setFilterUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // Search function
  const handleSearchChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    const filteredUsers = users.filter((user) =>
      user.movie_name.toLowerCase().includes(searchText) ||
      user.description.toLowerCase().includes(searchText) ||
      user.casting.toLowerCase().includes(searchText)
    );
    setFilterUsers(filteredUsers);
  };

  // Toggle selection for movies
  const handleCheckboxChange = (id) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter(movieId => movieId !== id));
    } else {
      setSelectedMovies([...selectedMovies, id]);
    }
  };

  // Delete selected movies
  const handleDeleteSelected = async () => {
    if (selectedMovies.length === 0) {
      alert("No movies selected!");
      return;
    }
  
    const isConfirmed = window.confirm("Are you sure you want to delete selected movies?");
    if (isConfirmed) {
      try {
        await axios.post('http://localhost:5000/users/delete-multiple', { ids: selectedMovies });
        setSelectedMovies([]); // Clear selected movies
        getAllUsers(); // Refresh the movies list
      } catch (error) {
        console.error("Error deleting selected movies:", error);
        alert("Failed to delete selected movies.");
      }
    }
  };

  // Delete function for individual movie
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this movie?");
    if (isConfirmed) {
      try {
        const res = await axios.delete(`http://localhost:5000/users/${id}`);
        setUsers(res.data); // Update the users state
        setFilterUsers(res.data); // This should match the state name
      } catch (error) {
        console.error("Error deleting movie:", error);
        alert("Failed to delete movie.");
      }
    }
  };

  // Add new movie record
  const handleAddRecord = () => {
    setUserData({ movie_name: "", description: "", casting: "" });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    getAllUsers();
  };

  // Handle user data change
  const handleData = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Handle submit for adding/updating movie
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      Movie_Name: userData.movie_name,
      Description: userData.description,
      Casting: userData.casting
    };

    try {
      if (userData.id) {
        const id = userData.id;
        await axios.patch(`http://localhost:5000/users/${id}`, dataToSend);
      } else {
        await axios.post("http://localhost:5000/users", dataToSend);
      }
      closeModal();
      setUserData({ movie_name: "", description: "", casting: "" });
    } catch (error) {
      console.error("Error saving movie:", error);
      alert("Failed to save movie.");
    }
  };

  // Edit function for movie
  const handleUpdateRecord = (user) => {
    setUserData(user);
    setIsModalOpen(true);
  };

  // Handle file upload and parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setExcelFile(file); // Set the uploaded file in state
  };

  // Process the uploaded Excel file
  const handleUpload = async () => {
    if (!excelFile) {
      alert("Please select an Excel file to upload!");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile); // Append the file to formData with the key "file"

    try {
      // Correct endpoint for file upload
      const response = await axios.post('http://localhost:5000/users/upload', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Refresh the list of users after successful upload
      getAllUsers();
      setExcelFile(null); // Clear the file state after upload
      alert("File uploaded and data added to the database successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };

  return (
    <>
      <div className="container">
        <h3>Movie Application</h3>
        <div className="input-search">
          <input type="search" placeholder="Search Movie Here" onChange={handleSearchChange} />
          <button className="btn green" onClick={handleAddRecord}>Add Movie</button>
          <button className="btn red" onClick={handleDeleteSelected}>Delete Selected</button>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-upload"
          />
          <button className="btn blue" onClick={() => document.getElementById('file-upload').click()}>Select Excel File</button>
          <button className="btn blue" onClick={handleUpload}>Upload Excel</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Movie</th>
              <th>Description</th>
              <th>Cast</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filterUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedMovies.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                </td>
                <td>{user.movie_name}</td>
                <td>{user.description}</td>
                <td>{user.casting}</td>
                <td><button className="btn green" onClick={() => handleUpdateRecord(user)}>Edit</button></td>
                <td><button className="btn red" onClick={() => handleDelete(user.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <h2>Movie Record</h2>
              <div className="input-group">
                <label htmlFor="name">Movie Name</label>
                <input type="text" value={userData.movie_name} onChange={handleData} name="movie_name" id="name" />
                <label htmlFor="desc">Description</label>
                <input type="text" value={userData.description} onChange={handleData} name="description" id="desc" />
                <label htmlFor="cast">Casting</label>
                <input type="text" value={userData.casting} onChange={handleData} name="casting" id="cast" />
              </div>
              <button className="btn green" onClick={handleSubmit}>Add Movie</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
