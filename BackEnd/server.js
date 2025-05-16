const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require("bcrypt");

// Create MySQL connection
const db = mysql.createConnection({
  host: "localhost", 
  user: "root", 
  password: "", 
  database: "school_managements", 
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});
// Register route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  try {
    // Check if username exists
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length > 0)
        return res.status(409).json({ message: "Username already exists" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: "Error saving user" });
        res.status(201).json({ message: "User registered successfully" });
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // You can generate a token here if needed
    res.status(200).json({ message: "Login successful", user: { id: user.id, username: user.username } });
  });
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



// ------------------------------------------------------Class------------------------------------------------------

// Add new class
app.get("/classes", (req, res) => {
  const sql = "SELECT id, name, number, bg_color AS bgColor FROM classes";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching classes:", err);
      return res.status(500).json({ message: "Failed to fetch classes." });
    }
    console.log("Returning classes:", results);  // Debug log
    res.status(200).json(results);
  });
});

// POST new class
app.post("/classes", (req, res) => {
  const { name, number } = req.body;
  
  if (!name || !number) {
    return res.status(400).json({ message: "Class name and number are required." });
  }

  // Get all used colors from the database
  const getUsedColorsSql = "SELECT bg_color FROM classes";
  db.query(getUsedColorsSql, (err, results) => {
    if (err) {
      console.error("Error fetching used colors:", err);
      return res.status(500).json({ message: "Failed to fetch color information." });
    }

    const colors = ['#FFC107', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722'];
    const usedColors = results.map(result => result.bg_color);
    
    // Filter out used colors
    const availableColors = colors.filter(color => !usedColors.includes(color));
    
    // If all colors have been used, reset the available colors to all colors
    const colorsToChooseFrom = availableColors.length > 0 ? availableColors : colors;
    
    // Select random color from available colors
    const bgColor = colorsToChooseFrom[Math.floor(Math.random() * colorsToChooseFrom.length)];

    // Debug log
    console.log(`Generated color: ${bgColor} for class ${name}. Available colors: ${colorsToChooseFrom}`);

    const sql = "INSERT INTO classes (name, number, bg_color) VALUES (?, ?, ?)";
    
    db.query(sql, [name, number, bgColor], (err, result) => {
      if (err) {
        console.error("Error inserting class:", err);
        return res.status(500).json({ message: "Failed to add class." });
      }
      
      // Verify the inserted data
      const checkSql = "SELECT * FROM classes WHERE id = ?";
      db.query(checkSql, [result.insertId], (err, insertedClass) => {
        if (err) {
          console.error("Error verifying insertion:", err);
          return res.status(500).json({ message: "Failed to verify class creation." });
        }
        
        console.log("Actually inserted:", insertedClass[0]);
        res.status(201).json({
          id: insertedClass[0].id,
          name: insertedClass[0].name,
          number: insertedClass[0].number,
          bgColor: insertedClass[0].bg_color // Map to camelCase here
        });
      });
    });
  });
});

// Delete a class by ID
app.delete("/classes/:id", (req, res) => {
  const { id } = req.params; // Extract class ID from URL
  const query = "DELETE FROM classes WHERE id = ?";
  const updateIdsQuery = `
    SET @count = 0;
    UPDATE classes SET id = @count := @count + 1;
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting class:", err);
      res.status(500).send({ error: "Failed to delete class" });
    } else if (result.affectedRows === 0) {
      // No rows affected indicates the class ID doesn't exist
      res.status(404).send({ message: "class not found" });
    } else {
      // Successfully deleted
      res.status(200).send({ message: "class deleted successfully" });
    }
  });
});


// ------------------------------------------------------Group------------------------------------------------------


// Add new groups
app.get("/groups", (req, res) => {
  const sql = "SELECT id, name, number, bg_color AS bgColor FROM groups";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching groups:", err);
      return res.status(500).json({ message: "Failed to fetch groups." });
    }
    console.log("Returning groups:", results);  // Debug log
    res.status(200).json(results);
  });
});

// POST new groups
app.post("/groups", (req, res) => {
  const { name, number } = req.body;
  
  if (!name || !number) {
    return res.status(400).json({ message: "groups name and number are required." });
  }

  // Get all used colors from the database
  const getUsedColorsSql = "SELECT bg_color FROM groups";
  db.query(getUsedColorsSql, (err, results) => {
    if (err) {
      console.error("Error fetching used colors:", err);
      return res.status(500).json({ message: "Failed to fetch color information." });
    }

    const colors = ['#FFC107', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722'];
    const usedColors = results.map(result => result.bg_color);
    
    // Filter out used colors
    const availableColors = colors.filter(color => !usedColors.includes(color));
    
    // If all colors have been used, reset the available colors to all colors
    const colorsToChooseFrom = availableColors.length > 0 ? availableColors : colors;
    
    // Select random color from available colors
    const bgColor = colorsToChooseFrom[Math.floor(Math.random() * colorsToChooseFrom.length)];

    // Debug log
    console.log(`Generated color: ${bgColor} for groups ${name}. Available colors: ${colorsToChooseFrom}`);

    const sql = "INSERT INTO groups (name, number, bg_color) VALUES (?, ?, ?)";
    
    db.query(sql, [name, number, bgColor], (err, result) => {
      if (err) {
        console.error("Error inserting groups:", err);
        return res.status(500).json({ message: "Failed to add groups." });
      }
      
      // Verify the inserted data
      const checkSql = "SELECT * FROM groups WHERE id = ?";
      db.query(checkSql, [result.insertId], (err, insertedGroups) => {
        if (err) {
          console.error("Error verifying insertion:", err);
          return res.status(500).json({ message: "Failed to verify groups creation." });
        }
        
        console.log("Actually inserted:", insertedGroups[0]);
        res.status(201).json({
          id: insertedGroups[0].id,
          name: insertedGroups[0].name,
          number: insertedGroups[0].number,
          bgColor: insertedGroups[0].bg_color // Map to camelCase here
        });
      });
    });
  });
});

// Delete a group by ID
app.delete("/groups/:id", (req, res) => {
  const { id } = req.params; // Extract groups ID from URL
  const query = "DELETE FROM groups WHERE id = ?";
  const updateIdsQuery = `
    SET @count = 0;
    UPDATE groups SET id = @count := @count + 1;
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting groups:", err);
      res.status(500).send({ error: "Failed to delete groups" });
    } else if (result.affectedRows === 0) {
      // No rows affected indicates the groups ID doesn't exist
      res.status(404).send({ message: "groups not found" });
    } else {
      // Successfully deleted
      res.status(200).send({ message: "groups deleted successfully" });
    }
  });
});
