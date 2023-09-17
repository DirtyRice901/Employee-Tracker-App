//////////Import required modules to run application//////////

const inquirer = require("inquirer");
const mysql = require("mysql2");


//////////Use createConnection() method to create a bridge between the Node.js and MySQL//////////

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_tracker"
});

//////////Connect to the database//////////

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to the Employee Tracker Database!");
    start();
});