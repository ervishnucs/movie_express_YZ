import express from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import multer from "multer";
import XLSX from "xlsx";
import fs from "fs";

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Route to handle file upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Check if file is present in the request
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read and parse the uploaded Excel file
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Insert each row from the Excel file into the PostgreSQL database
    for (const row of sheet) {
      const { Movie_Name, Description, Casting } = row;
      const Id = uuidv4(); // Generating a unique ID for each movie

      if (!Movie_Name || !Description || !Casting) {
        return res.status(400).json({
          message:
            "All fields (Movie_Name, Description, Casting) are required in Excel",
        });
      }

      await pool.query(
        "INSERT INTO movies (id, Movie_Name, Description, Casting) VALUES ($1, $2, $3, $4)",
        [Id, Movie_Name, Description, Casting]
      );
    }

    // Remove file after processing
    fs.unlinkSync(file.path);

    res.status(200).json({ message: "Movies added successfully from Excel" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all movies
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM movies");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get movie by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new movie
router.post("/", async (req, res) => {
  const { Movie_Name, Description, Casting } = req.body;

  // Validate required fields
  if (!Movie_Name || !Description || !Casting) {
    return res.status(400).json({
      message: "All fields (Movie_Name, Description, Casting) are required",
    });
  }
  const Id = uuidv4(); // Generating a unique ID
  try {
    const result = await pool.query(
      "INSERT INTO movies (id, Movie_Name, Description, Casting) VALUES ($1, $2, $3, $4) RETURNING *",
      [Id, Movie_Name, Description, Casting]
    );
    res.json({ message: "Movie added successfully", movie: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete selected movies
router.post("/delete-multiple", async (req, res) => {
  const { ids } = req.body; // Array of movie IDs

  if (!ids || ids.length === 0) {
    return res.status(400).json({ message: "No movie IDs provided" });
  }

  try {
    const deleteResult = await pool.query(
      "DELETE FROM movies WHERE id = ANY($1::uuid[]) RETURNING *",
      [ids]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "No movies found to delete" });
    }

    res.json({
      message: "Movies deleted successfully",
      deletedMovies: deleteResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update movie details
router.patch("/:id", async (req, res) => {
  const { Movie_Name, Description, Casting } = req.body;
  const id = req.params.id;
  if (!Movie_Name || !Description || !Casting) {
    return res.status(400).json({
      message: "All fields (Movie_Name, Description, Casting) are required",
    });
  }
  try {
    const result = await pool.query(
      "UPDATE movies SET Movie_Name = $1, Description = $2, Casting = $3 WHERE id = $4 RETURNING *",
      [Movie_Name, Description, Casting, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "Movie updated successfully", movie: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Replace movie details
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { Movie_Name, Description, Casting } = req.body;
  if (!Movie_Name || !Description || !Casting) {
    return res.status(400).json({
      message: "All fields (Movie_Name, Description, Casting) are required",
    });
  }
  try {
    const checkMovie = await pool.query("SELECT * FROM movies WHERE id = $1", [
      id,
    ]);
    if (checkMovie.rows.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const result = await pool.query(
      `UPDATE movies 
       SET Movie_Name = $1, 
           Description = $2, 
           Casting = $3
       WHERE id = $4 
       RETURNING *`,
      [Movie_Name, Description, Casting, id]
    );

    res.json({ message: "Movie replaced successfully", movie: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete individual movie by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteResult = await pool.query(
      "DELETE FROM movies WHERE id = $1 RETURNING *",
      [id]
    );
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Fetch updated list of movies
    const updatedMovies = await pool.query("SELECT * FROM movies");
    res.json({
      message: "Movie deleted successfully",
      movies: updatedMovies.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
