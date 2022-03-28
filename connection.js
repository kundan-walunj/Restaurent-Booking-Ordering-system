const mysql = require("mysql2")

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant",
});
  
db.connect((e) => {
    if (e) {
      throw e;
    }
    console.log("CONNECTED TO DB");
});
  
module.exports = db;