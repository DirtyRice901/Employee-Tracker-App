//////////Import required modules to run application/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const inquirer = require("inquirer");
const mysql = require("mysql2");



//////////Use createConnection() method to create a bridge between the Node.js and MySQL/////////////////////////////////////////////////////////////////////////////////

const connection = mysql.createConnection({
   
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Yogi1983",
    database: "employee_tracker"
});

//////////Connect to the database////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to the Employee Tracker Database!");
    start();
});

//////////Create a function to start app/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function start() {
    // The require method lets your application know that it needs to use the inquirer package to execute the code below //    
    inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update employee role",
                "Exit",
            ],
        }) 
        .then(function(answer) {
            if(answer.action === 'View all departments') {
                viewDepartments();
            } else if (answer.action === 'View all roles') {
                viewRoles();
            } else if (answer.action === 'View all employees') {
                viewEmployees();
            } else if (answer.action === 'Add a department') {
                addDepartment();
            } else if (answer.action === 'Add a role') {
                addRole();
            } else if (answer.action === 'Add an employee') {
                addEmployee();
            } else if (answer.action === 'Update employee role') {
                updateRole();
            } else if (answer.action === 'Exit') {
                connection.end();
                console.log("GoodBye");
            }
        });
}

//////////Create a function to view all departments//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function viewDepartments() {
    const query = "SELECT * FROM department";
    connection.query(query, (err, res) => {
        console.log(`DEPARTMENTS:`)
        res.forEach(department => {
            console.log(`ID: ${department.id} | Name: ${department.name}`);
        });
        start();    
    });
                                    /////////// potential throw method to see which is better//////////                       

    //     if (err) throw err;
    //     console.table(res);
    //     start();
    // });
}

//////////Create a function to view all roles////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function viewRoles() {
    const query = "SELECT * FROM role";
        connection.query(query, (err, res) => {
            console.log(`ROLES:`);
            res.forEach((role) => {
                console.log(`ID: ${role.id} | Title: ${role.title} | Salary: ${role.salary} | Department ID: ${role.department_id}`);
            }); 
            start();   
        });
        
}

//////////Create a function to view all employees////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function viewEmployees() {
    const query = "SELECT * FROM employee";
        connection.query(query, (err, res) => {
            console.log(`EMPLOYEES:`)
            res.forEach(employee => {
                console.log(`ID: ${employee.id} | First Name: ${employee.first_name} | Last Name: ${employee.last_name} | Role ID: ${employee.role_id} | Manager ID: ${employee.manager_id}`);
            })
            start();
        });
}

//////////Create a function to add a department//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addDepartment() {
    inquirer
        .prompt({
            name: "department",
            type: "input",
            message: "What department is being searched?",
        })
        .then(answer => {
            const query = "INSERT INTO department (name) VALUES ( ? )";
        connection.query(query, answer.department, (err, res) => {
            console.log(`This department has been added: ${(answer.department).toUpperCase()}`)
        })
        viewDepartments();    
        });
}

//////////Create a function to add a role////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addRole() {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw (err);
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter new roles title:",
                },
                {
                    type: "input",
                    name: "title",
                    message: "Enter new roles title:",   
                },
                {
                    type: "input",
                    name: "title",
                    message: "Enter new roles title:",
                    choices: res.map(
                        (department) => department.department_name
                    ),
                },

            ])
            .then((answers) => {
                const department = res.find(
                    (department) => department.name === answers.department
                );
                const query = "INSERT INTO roles SET ?";
                connection.query(
                    query,
                    {
                        title: answers.title,
                        salary: answers.salary,
                        department_id: department,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(
                            `Added role ${answers.title} with salary ${answers.salary} to the ${answers.department} department in the database...`
                        );
                        start();
                    }
                );
            });
    });
}

//////////Create a function to add an employee///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addEmployee() {
    connection.query("SELECT id, title FROM roles", (error, results) => {
        if (error) {
            console.error(error);
            return;
        }

        const roles = results.map(({ id, title}) => ({
            name: title,
            value: id,
        }));

        //////////////////////Retrieve list of employees to identify as managers from db///////////////////

        connection.query(
            'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee',
            (error, results) => {
                if (error) {
                    console.error(error);
                    return;
                }
                
                const managers = results.map(({ id, name}) => ({
                    name,
                    value: id,
                }));
                //////////////////Prompt user for employee info/////////////////////////
                inquirer
                    .prompt([
                        {
                            type: "input",
                            name: "firstName",
                            message: "Enter the employee's first name:",
                        },
                        {
                            type: "input",
                            name: "lastName",
                            message: "Enter the employee's last name:",
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Select the employee manager:",
                            choices: [
                                { name: "None", value: null },
                                ...managers,
                            ],
                        },
                    ])
                    .then((answers) => {
                        ///////////////input employee into database//////
                        const sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                        const values = [
                            answers.firstName,
                            answers.lastName,
                            answers.roleId,
                            answers.managerId,
                        ];
                        connection.query(sql, values, (error) => {
                            if (error) {
                                console.error(error);
                                return;
                            }

                            console.log("Employee added successfully...");
                            start();
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    })
            }
        )
    })
}

///////// Create a function to update an employee role///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateEmployeeRole() {
    const queryEmployees = "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id";
    const queryRoles = "SELECT * FROM roles";
    connection.query(queryEmployees, (err, resEmployees) => {
        if (err) throw err;
        connection.query(queryEmployees, (err, resEmployees) => {
            if (err) throw err;
            connection.query(queryRoles, (err, resRoles) => {
                if (err) throw err;
                inquirer
                    .prompt([
                        {
                            type: "list",
                            name: "employee",
                            nessage: "Select the employee to update",
                            choices: resEmployees.map(
                                (employee) =>
                                `${employee.first_name} ${employee.last_name}`   
                            ),
                        },
                        {
                            type: "list",
                            name: "role",
                            message: "Select the new role",
                            choices: resRoles.map((role) => role.title),
                        },
                    ])
                    .then((answers) => {
                        const employee = resEmployees.find(
                            (employee) => `${employee.first_name} ${employee.last_name}` ===
                            answers.employee
                        );
                        const role = resRoles.find(
                            (role) => role.title === answers.role
                        );
                        const query = "UPDATE employee SET role_id = ? WHERE id = ?";
                        connection.query(
                            query,
                            [role.id, employee.id],
                            (err, res) => {
                                if (err) throw err;
                                console.log(
                                    `Updated ${emplyee.first_name} ${employee.last_name}'s role to ${role.title} in the database... `
                                );
                                start();

                            }
                        );
                    });
            });
        });
    });
}