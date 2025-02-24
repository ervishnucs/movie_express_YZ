# Movie API

This API allows users to manage a movie database using Express.js and PostgreSQL. It supports operations such as adding, updating, deleting, and retrieving movie records. It also provides an endpoint for bulk uploading movie data from an Excel file.

## Features
- Upload movies via an Excel file.
- Retrieve all movies or a specific movie by ID.
- Add new movies.
- Update or replace existing movies.
- Delete individual movies or multiple selected movies.

## Installation

1. Clone the repository:
   ```sh
   git clone <repository_url>
   cd <repository_folder>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure PostgreSQL database connection in `db.js`.
4. Start the server:
   ```sh
   npm start
   ```

## API Endpoints

### Upload Movies from Excel
**POST** `/upload`
- Uploads an Excel file and inserts movie data into the database.
- **Request:** Multipart form-data (`file` field containing `.xlsx` file)
- **Response:** `{ message: "Movies added successfully from Excel" }`

### Get All Movies
**GET** `/`
- Retrieves all movies.
- **Response:** JSON array of movies.

### Get Movie by ID
**GET** `/:id`
- Retrieves a specific movie by ID.
- **Response:** `{ id, Movie_Name, Description, Casting }`

### Add a Movie
**POST** `/`
- Adds a new movie.
- **Request Body:**
  ```json
  {
    "Movie_Name": "Example Movie",
    "Description": "Example Description",
    "Casting": "Actor1, Actor2"
  }
  ```
- **Response:** `{ message: "Movie added successfully", movie: { ... } }`

### Update a Movie
**PATCH** `/:id`
- Updates specific fields of a movie.
- **Request Body:** Same as Add Movie.
- **Response:** `{ message: "Movie updated successfully", movie: { ... } }`

### Replace a Movie
**PUT** `/:id`
- Replaces a movie entry.
- **Request Body:** Same as Add Movie.
- **Response:** `{ message: "Movie replaced successfully", movie: { ... } }`

### Delete a Movie
**DELETE** `/:id`
- Deletes a movie by ID.
- **Response:** `{ message: "Movie deleted successfully", movies: [...] }`

### Delete Multiple Movies
**POST** `/delete-multiple`
- Deletes multiple movies by providing an array of IDs.
- **Request Body:**
  ```json
  {
    "ids": ["uuid1", "uuid2"]
  }
  ```
- **Response:** `{ message: "Movies deleted successfully", deletedMovies: [...] }`

## Technologies Used
- **Express.js** – Backend framework
- **PostgreSQL** – Database
- **Multer** – File upload handling
- **XLSX** – Excel file parsing
- **UUID** – Unique ID generation
- **Node.js** – JavaScript runtime

## License
This project is open-source and available under the MIT License.

