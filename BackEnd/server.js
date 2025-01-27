const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create MySQL connection
const db = mysql.createConnection({
  host: "localhost", // Replace with your MySQL host
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "school_managements", // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// ------------------------------------------------------Students------------------------------------------------------

// Get students data
app.get("/students", (req, res) => {
  const query = "SELECT * FROM students";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching students:", err);
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Delete a student by ID
app.delete("/students/:id", (req, res) => {
  const { id } = req.params; // Extract student ID from URL
  const query = "DELETE FROM students WHERE id = ?";
  const updateIdsQuery = `
    SET @count = 0;
    UPDATE students SET id = @count := @count + 1;
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting student:", err);
      res.status(500).send({ error: "Failed to delete student" });
    } else if (result.affectedRows === 0) {
      // No rows affected indicates the student ID doesn't exist
      res.status(404).send({ message: "Student not found" });
    } else {
      // Successfully deleted
      res.status(200).send({ message: "Student deleted successfully" });
    }
  });
});

// Update a student by ID
app.put("/students/:id", (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    parent_name,
    parent_tel,
    adresse,
    email,
    age,
    inscription_date,
    price,
  } = req.body;

  const query = `
    UPDATE students 
    SET 
      first_name = ?, 
      last_name = ?,
      parent_name = ?,
      parent_tel = ?,
      adresse = ?,
      email = ?,
      age = ?,
      inscription_date = ?,
      price = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      first_name,
      last_name,
      parent_name,
      parent_tel,
      adresse,
      email,
      age,
      inscription_date,
      price,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating student:", err);
        res.status(500).send({ error: "Failed to update student" });
      } else if (result.affectedRows === 0) {
        res.status(404).send({ message: "Student not found" });
      } else {
        res.status(200).send({ message: "Student updated successfully" });
      }
    }
  );
});

//Add new student

app.post("/add", (req, res) => {
  const {
    id,
    first_name,
    last_name,
    adresse,
    age,
    parent_name,
    parent_tel,
    inscription_date,
    price,
    email,
  } = req.body;

  // Validate incoming data
  if (
    !id ||
    !first_name ||
    !last_name ||
    !adresse ||
    !age ||
    !parent_name ||
    !parent_tel ||
    !inscription_date ||
    !price ||
    !email
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // SQL query to insert data into the database
  const sql = `
    INSERT INTO students (
      id,
      first_name,
      last_name,
      adresse,
      age,
      parent_name,
      parent_tel,
      inscription_date,
      price,
      email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    id,
    first_name,
    last_name,
    adresse,
    age,
    parent_name,
    parent_tel,
    inscription_date,
    price,
    email,
  ];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data: ", err.message);
      return res.status(500).json({ message: "Error saving data." });
    }
    res.status(200).json({ message: "Data saved successfully." });
  });
});

//Search students
app.get("/search", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Search query is required." });
  }

  const sql = `
    SELECT * FROM students
    WHERE id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
  `;

  const values = [`%${query}%`, `%${query}%`, `%${query}%`];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching search results:", err);
      res.status(500).json({ error: "Failed to fetch search results." });
    } else {
      res.json(results);
    }
  });
});

// ------------------------------------------------------Teachers------------------------------------------------------

// Get teachers data
app.get("/teachers", (req, res) => {
  const query = "SELECT * FROM teachers";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching teachers:", err);
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Delete a teacher by ID
app.delete("/teachers/:id", (req, res) => {
  const { id } = req.params; // Extract student ID from URL
  const query = "DELETE FROM teachers WHERE id = ?";
  const updateCINsQuery = `
    SET @count = 0;
    UPDATE teachers SET id = @count := @count + 1;
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting teacher:", err);
      res.status(500).send({ error: "Failed to delete teacher" });
    } else if (result.affectedRows === 0) {
      // No rows affected indicates the teacher ID doesn't exist
      res.status(404).send({ message: "teacher not found" });
    } else {
      // Successfully deleted
      res.status(200).send({ message: "teacher deleted successfully" });
    }
  });
});

// Update a teacher by ID
app.put("/teachers/:id", (req, res) => {
  const { id } = req.params;
  const { cin, fullname, email, date_registration, tel, adresse } = req.body;

  const query = `
    UPDATE teachers
    SET
      cin = ?,
      fullname = ?,
      email = ?,
      date_registration = ?,
      tel = ?,
      adresse = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [cin, fullname, email, date_registration, tel, adresse, id],
    (err, result) => {
      if (err) {
        console.error("Error updating Teacher:", err);
        res.status(500).send({ error: "Failed to update Teacher" });
      } else if (result.affectedRows === 0) {
        res.status(404).send({ message: "Teacher not found" });
      } else {
        res.status(200).send({ message: "Teacher updated successfully" });
      }
    }
  );
});


//Add new teacher

app.post("/add_t", (req, res) => {
  const { cin, fullname, email, date_registration, tel, adresse } = req.body;

  // Validate incoming data
  if (!cin || !fullname || !email || !date_registration || !tel || !adresse) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // SQL query to insert data into the database
  const sql = `
    INSERT INTO teachers (
        cin,
        fullname,
        email,
        date_registration,
        tel,
        adresse
    ) VALUES (?, ?, ?, ?, ?, ?)`;

  const values = [cin, fullname, email, date_registration, tel, adresse];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data: ", err.message);
      return res.status(500).json({ message: "Error saving data." });
    }
    res.status(200).json({ message: "Data saved successfully." });
  });
});



//Search teachers
app.get("/search_t", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Search query is required." });
  }

  const sql = `
    SELECT * FROM teachers
    WHERE cin LIKE ? OR fullname LIKE ? OR adresse LIKE ? 
  `;

  const values = [`%${query}%`, `%${query}%`, `%${query}%`];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching search results:", err);
      res.status(500).json({ error: "Failed to fetch search results." });
    } else {
      res.json(results);
    }
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
