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



// GET total number of students
app.get("/students/total", (req, res) => {
  const sql = "SELECT COUNT(*) as total FROM students";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error calculating total students:", err);
      return res.status(500).json({ message: "Failed to calculate total students." });
    }
    
    const total = results[0].total;
    
    // Return just the total number
    res.status(200).json({ total: total });
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



// ------------------------------------------------------Modules------------------------------------------------------



// Add new module
app.get("/modules", (req, res) => {
  const sql = "SELECT id, module_name,date_creation, bg_color AS bgColor FROM modules";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching modules:", err);
      return res.status(500).json({ message: "Failed to fetch modules." });
    }
    console.log("Returning modules:", results);  // Debug log
    res.status(200).json(results);
  });
});

// POST new module
app.post("/modules", (req, res) => {
  const { module_name,date_creation } = req.body;
  
  if (!module_name || !date_creation) {
    return res.status(400).json({ message: "Class module_name and date_creation are required." });
  }

  // Get all used colors from the database
  const getUsedColorsSql = "SELECT bg_color FROM modules";
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
    console.log(`Generated color: ${bgColor} for module ${module_name}. Available colors: ${colorsToChooseFrom}`);

    const sql = "INSERT INTO modules (module_name,date_creation, bg_color) VALUES (?, ?, ?)";
    
    db.query(sql, [module_name,date_creation, bgColor], (err, result) => {
      if (err) {
        console.error("Error inserting module:", err);
        return res.status(500).json({ message: "Failed to add module." });
      }
      
      // Verify the inserted data
      const checkSql = "SELECT * FROM modules WHERE id = ?";
      db.query(checkSql, [result.insertId], (err, insertedModule) => {
        if (err) {
          console.error("Error verifying insertion:", err);
          return res.status(500).json({ message: "Failed to verify module creation." });
        }
        
        console.log("Actually inserted:", insertedModule[0]);
        res.status(201).json({
          id: insertedModule[0].id,
          module_name: insertedModule[0].module_name,
          date_creation: insertedModule[0].date_creation,
          bgColor: insertedModule[0].bg_color // Map to camelCase here
        });
      });
    });
  });
});

// Delete a module by ID
app.delete("/modules/:id", (req, res) => {
  const { id } = req.params; // Extract class ID from URL
  const query = "DELETE FROM modules WHERE id = ?";
  const updateIdsQuery = `
    SET @count = 0;
    UPDATE modules SET id = @count := @count + 1;
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting module:", err);
      res.status(500).send({ error: "Failed to delete module" });
    } else if (result.affectedRows === 0) {
      // No rows affected indicates the module ID doesn't exist
      res.status(404).send({ message: "module not found" });
    } else {
      // Successfully deleted
      res.status(200).send({ message: "module deleted successfully" });
    }
  });
});


// ------------------------------------------------------Group------------------------------------------------------


// Add new groups
app.get("/groups", (req, res) => {
  const sql = "SELECT id, name, number, bg_color AS bgColor FROM `groups`";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching groups:", err);
      return res.status(500).json({ message: "Failed to fetch groups." });
    }
    console.log("Returning groups:", results);  // Debug log
    res.status(200).json(results);
  });
});



// GET total number of groups
app.get("/groups/total", (req, res) => {
  const sql = "SELECT COUNT(*) as total FROM classes";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error calculating total groups:", err);
      return res.status(500).json({ message: "Failed to calculate total groups." });
    }
    
    const total = results[0].total;
    
    // Return just the total number
    res.status(200).json({ total: total });
  });
});

// POST new groups
app.post("/groups", (req, res) => {
  const { name, number } = req.body;
  
  if (!name || !number) {
    return res.status(400).json({ message: "groups name and number are required." });
  }

  // Get all used colors from the database
  const getUsedColorsSql = "SELECT bg_color FROM `groups`";
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

    const sql = "INSERT INTO `groups` (name, number, bg_color) VALUES (?, ?, ?)";
    
    db.query(sql, [name, number, bgColor], (err, result) => {
      if (err) {
        console.error("Error inserting groups:", err);
        return res.status(500).json({ message: "Failed to add groups." });
      }
      
      // Verify the inserted data
      const checkSql = "SELECT * FROM `groups` WHERE id = ?";
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
  const query = "DELETE FROM `groups` WHERE id = ?";
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

// Backend API endpoints for chart data


// GET groups by year and class type
app.get("/groups/by-year", (req, res) => {
  const sql = `
    SELECT 
      YEAR(date_creation) as year,
      COUNT(CASE WHEN name LIKE '%A%' THEN 1 END) as classA,
      COUNT(CASE WHEN name LIKE '%B%' THEN 1 END) as classB,
      COUNT(CASE WHEN name LIKE '%C%' THEN 1 END) as classC,
      COUNT(*) as total
    FROM classes
    WHERE date_creation IS NOT NULL
    GROUP BY YEAR(date_creation)
    ORDER BY year ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching groups by year:", err);
      return res.status(500).json({ message: "Failed to fetch groups by year." });
    }
    
    // If no results, return empty array
    if (!results || results.length === 0) {
      // Generate sample data for years 2020-2024 if no data exists
      const sampleData = [
        { year: 2020, classA: 8, classB: 12, classC: 15, total: 35 },
        { year: 2021, classA: 10, classB: 15, classC: 18, total: 43 },
        { year: 2022, classA: 12, classB: 18, classC: 22, total: 52 },
        { year: 2023, classA: 15, classB: 20, classC: 25, total: 60 },
        { year: 2024, classA: 18, classB: 22, classC: 28, total: 68 }
      ];
      return res.status(200).json(sampleData);
    }
    
    // Return the results
    res.status(200).json(results);
  });
});

// GET student gender distribution
app.get("/students/gender-distribution", (req, res) => {
  // First try with gender field
  const sql = `
    SELECT 
      COALESCE(gender, 'unknown') as gender,
      COUNT(*) as count
    FROM students
    GROUP BY gender
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching student gender distribution:", err);
      return res.status(500).json({ message: "Failed to fetch student gender distribution." });
    }
    
    // If no gender field or no results, try to estimate based on first names
    if (!results || results.length <= 1) {
      const estimateSQL = `
        SELECT 
          CASE 
            WHEN first_name LIKE '%a' OR first_name LIKE '%ia' OR first_name LIKE '%na' 
            OR first_name LIKE '%ine' OR first_name LIKE '%elle' THEN 'female'
            ELSE 'male'
          END as gender,
          COUNT(*) as count
        FROM students
        GROUP BY gender
      `;
      
      db.query(estimateSQL, (err, estimatedResults) => {
        if (err || !estimatedResults || estimatedResults.length === 0) {
          // If still no results, return sample data
          return res.status(200).json([
            { gender: 'male', count: 44 },
            { gender: 'female', count: 55 }
          ]);
        }
        
        res.status(200).json(estimatedResults);
      });
    } else {
      // Map unknown to either male or female for simplicity in the chart
      const mappedResults = results.map(item => {
        if (item.gender === 'unknown') {
          return { gender: 'male', count: item.count };
        }
        return item;
      });
      
      // Combine any duplicate entries after mapping
      const genderMap = new Map();
      mappedResults.forEach(item => {
        const current = genderMap.get(item.gender) || 0;
        genderMap.set(item.gender, current + item.count);
      });
      
      const finalResults = Array.from(genderMap.entries()).map(([gender, count]) => ({ gender, count }));
      res.status(200).json(finalResults);
    }
  });
});

// ------------------------------------------------------Announcements------------------------------------------------------

// Add new Announcement
app.get("/announcements", (req, res) => {
  const sql = "SELECT id, 	author_name, title, content FROM `announcements`";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching groups:", err);
      return res.status(500).json({ message: "Failed to fetch groups." });
    }
    console.log("Returning announcements:", results);  // Debug log
    res.status(200).json(results);
  });
});

// POST new Announcements
app.post("/announcements", (req, res) => {
  const {author_name, title, content } = req.body;
  
     if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const sql = "INSERT INTO `announcements` (author_name, title, content) VALUES (?, ?, ?)";
    
    db.query(sql, [	author_name, title, content], (err, result) => {
      if (err) {
        console.error("Error inserting announcements:", err);
        return res.status(500).json({ message: "Failed to add announcements." });
      }
      
      // Verify the inserted data
      const checkSql = "SELECT * FROM `announcements` WHERE id = ?";
      db.query(checkSql, [result.insertId], (err, insertedAnnouncements) => {
        if (err) {
          console.error("Error verifying insertion:", err);
          return res.status(500).json({ message: "Failed to verify Announcements creation." });
        }
        console.log("Actually inserted:", insertedAnnouncements[0]);
        res.status(201).json({
          id: insertedAnnouncements[0].id,
          author_name: insertedAnnouncements[0].author_name,
          title: insertedAnnouncements[0].title,
          content: insertedAnnouncements[0].content 
        });
      });
    });
  });

// Delete a group by ID
app.delete("/announcements/:id", (req, res) => {
  const { id } = req.params; // Extract announcements ID from URL
  const query = "DELETE FROM `announcements` WHERE id = ?";
  const updateIdsQuery = `
    SET @count = 0;
    UPDATE announcements SET id = @count := @count + 1;
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting announcements:", err);
      res.status(500).send({ error: "Failed to delete announcements" });
    } else if (result.affectedRows === 0) {
      // No rows affected indicates the announcements ID doesn't exist
      res.status(404).send({ message: "announcements not found" });
    } else {
      // Successfully deleted
      res.status(200).send({ message: "announcements deleted successfully" });
    }
  });
});



//------------------------------------------------------Exams------------------------------------------------------




// GET all exams
app.get("/exams", (req, res) => {
  const sql = "SELECT id, module_name, numero_control, date_exam, bg_color AS bgColor FROM exams";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching exams:", err);
      return res.status(500).json({ message: "Failed to fetch exams." });
    }
    console.log("Returning exams:", results);  // Debug log
    res.status(200).json(results);
  });
});

// POST new exam
app.post("/exams", (req, res) => {
  const { module_name, numero_control, date_exam } = req.body;
  
  if (!module_name || !numero_control || !date_exam) {
    return res.status(400).json({ message: "Module name, control number, and exam date are required." });
  }

  // Get all used colors from the database
  const getUsedColorsSql = "SELECT bg_color FROM exams";
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
    console.log(`Generated color: ${bgColor} for exam ${module_name}. Available colors: ${colorsToChooseFrom}`);

    const sql = "INSERT INTO exams (module_name, numero_control, date_exam, bg_color) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [module_name, numero_control, date_exam, bgColor], (err, result) => {
      if (err) {
        console.error("Error inserting exam:", err);
        return res.status(500).json({ message: "Failed to add exam." });
      }
      
      // Verify the inserted data
      const checkSql = "SELECT * FROM exams WHERE id = ?";
      db.query(checkSql, [result.insertId], (err, insertedExam) => {
        if (err) {
          console.error("Error verifying insertion:", err);
          return res.status(500).json({ message: "Failed to verify exam creation." });
        }
        
        console.log("Actually inserted:", insertedExam[0]);
        res.status(201).json({
          id: insertedExam[0].id,
          module_name: insertedExam[0].module_name,
          numero_control: insertedExam[0].numero_control,
          date_exam: insertedExam[0].date_exam,
          bgColor: insertedExam[0].bg_color // Map to camelCase here
        });
      });
    });
  });
});

// DELETE an exam by ID
app.delete("/exams/:id", (req, res) => {
  const { id } = req.params; // Extract exam ID from URL
  const query = "DELETE FROM exams WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting exam:", err);
      res.status(500).json({ message: "Failed to delete exam" });
    } else if (result.affectedRows === 0) {
      // No rows affected indicates the exam ID doesn't exist
      res.status(404).json({ message: "Exam not found" });
    } else {
      // Successfully deleted
      res.status(200).json({ message: "Exam deleted successfully" });
    }
  });
});

//------------------------------------------------------Revenue------------------------------------------------------

// GET all revenue entries
app.get("/revenue", (req, res) => {
  const sql = "SELECT * FROM revenue ORDER BY date DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching revenue data:", err);
      return res.status(500).json({ message: "Failed to fetch revenue data." });
    }
    res.status(200).json(results);
  });
});

// GET revenue summary (totals and statistics)
app.get("/revenue/summary", (req, res) => {
  const sql = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'outcome' THEN amount ELSE 0 END) as total_outcome,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance
    FROM revenue
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error calculating revenue summary:", err);
      return res.status(500).json({ message: "Failed to calculate revenue summary." });
    }
    
    // Get monthly data for charts
    const monthlyDataSQL = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'outcome' THEN amount ELSE 0 END) as outcome
      FROM revenue
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC
    `;
    
    db.query(monthlyDataSQL, (err, monthlyData) => {
      if (err) {
        console.error("Error fetching monthly revenue data:", err);
        return res.status(500).json({ message: "Failed to fetch monthly revenue data." });
      }
      
      // Get category breakdown
      const categorySQL = `
        SELECT 
          category,
          type,
          SUM(amount) as total
        FROM revenue
        GROUP BY category, type
        ORDER BY total DESC
      `;
      
      db.query(categorySQL, (err, categoryData) => {
        if (err) {
          console.error("Error fetching category breakdown:", err);
          return res.status(500).json({ message: "Failed to fetch category breakdown." });
        }
        
        res.status(200).json({
          summary: results[0],
          monthly: monthlyData,
          categories: categoryData
        });
      });
    });
  });
});

// POST new revenue entry
app.post("/revenue", (req, res) => {
  const { description, amount, type, category, date } = req.body;
  
  if (!description || !amount || !type || !date) {
    return res.status(400).json({ message: "Description, amount, type, and date are required." });
  }
  
  if (type !== 'income' && type !== 'outcome') {
    return res.status(400).json({ message: "Type must be either 'income' or 'outcome'." });
  }
  
  const sql = "INSERT INTO revenue (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)";
  
  db.query(sql, [description, amount, type, category || null, date], (err, result) => {
    if (err) {
      console.error("Error inserting revenue entry:", err);
      return res.status(500).json({ message: "Failed to add revenue entry." });
    }
    
    // Return the newly created entry
    const checkSql = "SELECT * FROM revenue WHERE id = ?";
    db.query(checkSql, [result.insertId], (err, insertedRevenue) => {
      if (err) {
        console.error("Error verifying insertion:", err);
        return res.status(500).json({ message: "Failed to verify revenue entry creation." });
      }
      
      res.status(201).json(insertedRevenue[0]);
    });
  });
});

// DELETE a revenue entry by ID
app.delete("/revenue/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM revenue WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting revenue entry:", err);
      res.status(500).json({ message: "Failed to delete revenue entry" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: "Revenue entry not found" });
    } else {
      res.status(200).json({ message: "Revenue entry deleted successfully" });
    }
  });
});

// GET all absences
app.get("/absences", (req, res) => {
  const sql = `
    SELECT 
      a.id, 
      a.module_name, 
      a.student_name, 
      a.absence_date, 
      a.seance, 
      a.justification,
      a.bg_color AS bgColor,
      a.created_at
    FROM absences a
    ORDER BY a.absence_date DESC, a.seance ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching absences:", err);
      return res.status(500).json({ message: "Failed to fetch absences." });
    }
    res.status(200).json(results);
  });
});

// GET absences with student details
app.get("/absences/details", (req, res) => {
  const sql = `
    SELECT 
      a.id, 
      a.module_name, 
      a.student_name, 
      a.absence_date, 
      a.seance, 
      a.justification,
      a.bg_color AS bgColor,
      a.created_at,
      CONCAT(s.first_name, ' ', s.last_name) AS full_name,
      s.email,
      s.parent_tel
    FROM absences a
    LEFT JOIN students s ON CONCAT(s.first_name, ' ', s.last_name) = a.student_name
    ORDER BY a.absence_date DESC, a.seance ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching absences with details:", err);
      return res.status(500).json({ message: "Failed to fetch absences with details." });
    }
    res.status(200).json(results);
  });
});

// GET absences summary statistics
app.get("/absences/summary", (req, res) => {
  // Get total absences count
  const totalSQL = "SELECT COUNT(*) as total FROM absences";
  
  db.query(totalSQL, (err, totalResults) => {
    if (err) {
      console.error("Error calculating total absences:", err);
      return res.status(500).json({ message: "Failed to calculate total absences." });
    }
    
    // Get absences by module
    const byModuleSQL = `
      SELECT 
        module_name, 
        COUNT(*) as count 
      FROM absences 
      GROUP BY module_name 
      ORDER BY count DESC
    `;
    
    db.query(byModuleSQL, (err, moduleResults) => {
      if (err) {
        console.error("Error calculating absences by module:", err);
        return res.status(500).json({ message: "Failed to calculate absences by module." });
      }
      
      // Get absences by student
      const byStudentSQL = `
        SELECT 
          student_name, 
          COUNT(*) as count 
        FROM absences 
        GROUP BY student_name 
        ORDER BY count DESC 
        LIMIT 10
      `;
      
      db.query(byStudentSQL, (err, studentResults) => {
        if (err) {
          console.error("Error calculating absences by student:", err);
          return res.status(500).json({ message: "Failed to calculate absences by student." });
        }
        
        // Get absences by date (for trend chart)
        const byDateSQL = `
          SELECT 
            absence_date, 
            COUNT(*) as count 
          FROM absences 
          GROUP BY absence_date 
          ORDER BY absence_date ASC 
          LIMIT 30
        `;
        
        db.query(byDateSQL, (err, dateResults) => {
          if (err) {
            console.error("Error calculating absences by date:", err);
            return res.status(500).json({ message: "Failed to calculate absences by date." });
          }
          
          // Get absences by seance
          const bySeanceSQL = `
            SELECT 
              seance, 
              COUNT(*) as count 
            FROM absences 
            GROUP BY seance 
            ORDER BY count DESC
          `;
          
          db.query(bySeanceSQL, (err, seanceResults) => {
            if (err) {
              console.error("Error calculating absences by seance:", err);
              return res.status(500).json({ message: "Failed to calculate absences by seance." });
            }
            
            res.status(200).json({
              total: totalResults[0].total,
              byModule: moduleResults,
              byStudent: studentResults,
              byDate: dateResults,
              bySeance: seanceResults
            });
          });
        });
      });
    });
  });
});

// GET student names for dropdown
app.get("/absences/students", (req, res) => {
  const sql = "SELECT CONCAT(first_name, ' ', last_name) AS name FROM students ORDER BY first_name, last_name";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching student names:", err);
      return res.status(500).json({ message: "Failed to fetch student names." });
    }
    
    const studentNames = results.map(result => result.name);
    res.status(200).json(studentNames);
  });
});

// GET module names for dropdown
app.get("/absences/modules", (req, res) => {
  const sql = "SELECT module_name FROM modules ORDER BY module_name";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching module names:", err);
      return res.status(500).json({ message: "Failed to fetch module names." });
    }
    
    const moduleNames = results.map(result => result.module_name);
    res.status(200).json(moduleNames);
  });
});

// POST new absence
app.post("/absences", (req, res) => {
  const { module_name, student_name, absence_date, seance, justification } = req.body;
  
  if (!module_name || !student_name || !absence_date || !seance) {
    return res.status(400).json({ message: "Module name, student name, absence date, and seance are required." });
  }

  // Get all used colors from the database
  const getUsedColorsSql = "SELECT bg_color FROM absences";
  db.query(getUsedColorsSql, (err, results) => {
    if (err) {
      console.error("Error fetching used colors:", err);
      return res.status(500).json({ message: "Failed to fetch color information." });
    }

    const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4'];
    const usedColors = results.map(result => result.bg_color);
    
    // Filter out used colors
    const availableColors = colors.filter(color => !usedColors.includes(color));
    
    // If all colors have been used, reset the available colors to all colors
    const colorsToChooseFrom = availableColors.length > 0 ? availableColors : colors;
    
    // Select random color from available colors
    const bgColor = colorsToChooseFrom[Math.floor(Math.random() * colorsToChooseFrom.length)];

    const sql = "INSERT INTO absences (module_name, student_name, absence_date, seance, justification, bg_color) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [module_name, student_name, absence_date, seance, justification || null, bgColor], (err, result) => {
      if (err) {
        console.error("Error inserting absence:", err);
        return res.status(500).json({ message: "Failed to add absence." });
      }
      
      // Return the newly created absence
      const checkSql = "SELECT * FROM absences WHERE id = ?";
      db.query(checkSql, [result.insertId], (err, insertedAbsence) => {
        if (err) {
          console.error("Error verifying insertion:", err);
          return res.status(500).json({ message: "Failed to verify absence creation." });
        }
        
        res.status(201).json({
          id: insertedAbsence[0].id,
          module_name: insertedAbsence[0].module_name,
          student_name: insertedAbsence[0].student_name,
          absence_date: insertedAbsence[0].absence_date,
          seance: insertedAbsence[0].seance,
          justification: insertedAbsence[0].justification,
          bgColor: insertedAbsence[0].bg_color
        });
      });
    });
  });
});

// DELETE an absence by ID
app.delete("/absences/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM absences WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting absence:", err);
      res.status(500).json({ message: "Failed to delete absence" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: "Absence not found" });
    } else {
      res.status(200).json({ message: "Absence deleted successfully" });
    }
  });
});


//=================================================================
// Backend API endpoints for group-only charts
// Add these to your server.js file

// GET groups by year and class type (already exists, but included for completeness)
app.get("/groups/by-year", (req, res) => {
  const sql = `
    SELECT 
      YEAR(created_at) as year,
      COUNT(CASE WHEN name LIKE '%A%' THEN 1 END) as classA,
      COUNT(CASE WHEN name LIKE '%B%' THEN 1 END) as classB,
      COUNT(CASE WHEN name LIKE '%C%' THEN 1 END) as classC,
      COUNT(*) as total
    FROM classes
    WHERE created_at IS NOT NULL
    GROUP BY YEAR(created_at)
    ORDER BY year ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching groups by year:", err);
      return res.status(500).json({ message: "Failed to fetch groups by year." });
    }
    
    // If no results, return sample data
    if (!results || results.length === 0) {
      const currentYear = new Date().getFullYear();
      const sampleData = [
        { year: currentYear-4, classA: 8, classB: 12, classC: 15, total: 35 },
        { year: currentYear-3, classA: 10, classB: 15, classC: 18, total: 43 },
        { year: currentYear-2, classA: 12, classB: 18, classC: 22, total: 52 },
        { year: currentYear-1, classA: 15, classB: 20, classC: 25, total: 60 },
        { year: currentYear, classA: 18, classB: 22, classC: 28, total: 68 }
      ];
      return res.status(200).json(sampleData);
    }
    
    // Return the results
    res.status(200).json(results);
  });
});

// GET groups by type (new endpoint)
app.get("/groups/by-type", (req, res) => {
  const sql = `
    SELECT 
      CASE 
        WHEN name LIKE '%A%' THEN 'Class A'
        WHEN name LIKE '%B%' THEN 'Class B'
        WHEN name LIKE '%C%' THEN 'Class C'
        ELSE 'Other'
      END as type,
      COUNT(*) as count
    FROM classes
    GROUP BY 
      CASE 
        WHEN name LIKE '%A%' THEN 'Class A'
        WHEN name LIKE '%B%' THEN 'Class B'
        WHEN name LIKE '%C%' THEN 'Class C'
        ELSE 'Other'
      END
    ORDER BY count DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching groups by type:", err);
      return res.status(500).json({ message: "Failed to fetch groups by type." });
    }
    
    // If no results, return sample data
    if (!results || results.length === 0) {
      return res.status(200).json([
        { type: 'Class A', count: 25 },
        { type: 'Class B', count: 35 },
        { type: 'Class C', count: 40 }
      ]);
    }
    
    // Return the results
    res.status(200).json(results);
  });
});

// GET groups growth over time (new endpoint)
app.get("/groups/growth", (req, res) => {
  const sql = `
    SELECT 
      YEAR(created_at) as year,
      MONTH(created_at) as month,
      COUNT(*) as new_groups,
      (
        SELECT COUNT(*) 
        FROM classes 
        WHERE created_at <= LAST_DAY(CONCAT(t.year, '-', t.month, '-01'))
      ) as cumulative_total
    FROM 
      classes t
    WHERE 
      created_at IS NOT NULL
    GROUP BY 
      YEAR(created_at), MONTH(created_at)
    ORDER BY 
      year ASC, month ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching groups growth:", err);
      return res.status(500).json({ message: "Failed to fetch groups growth." });
    }
    
    // If no results, return sample data
    if (!results || results.length === 0) {
      const currentYear = new Date().getFullYear();
      const sampleData = [];
      let cumulative = 0;
      
      // Generate monthly data for the past 2 years
      for (let y = currentYear-1; y <= currentYear; y++) {
        for (let m = 1; m <= 12; m++) {
          // Skip future months
          if (y === currentYear && m > new Date().getMonth() + 1) {
            break;
          }
          
          const newGroups = Math.floor(Math.random() * 5) + 1; // 1-5 new groups per month
          cumulative += newGroups;
          
          sampleData.push({
            year: y,
            month: m,
            new_groups: newGroups,
            cumulative_total: cumulative
          });
        }
      }
      
      return res.status(200).json(sampleData);
    }
    
    // Return the results
    res.status(200).json(results);
  });
});
