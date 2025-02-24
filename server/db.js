import pkg from "pg";
const { Pool } = pkg;

// Create a pool of connections to PostgreSQL
const pool = new Pool({
  user: "postgres", // your PostgreSQL username
  host: "localhost", // database host
  database: "movie", // your database name
  password: "vishnu", // your PostgreSQL password
  port: 5432, // default PostgreSQL port
});

export default pool;
