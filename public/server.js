require('dotenv').config();

// Import and require mysql2
const mysql = require('mysql2');
const inquirer = require("inquirer");
// Connect to database
const db = mysql.createConnection(
  {
    host: '127.0.0.1',
    // MySQL username,
    user: 'root',
    password: process.env.PASSWORD,
    database: 'employee_tracker_db'
  },
  console.log(`
███████ ███    ███ ██████  ██       ██████  ██    ██ ███████ ███████     
██      ████  ████ ██   ██ ██      ██    ██  ██  ██  ██      ██          
█████   ██ ████ ██ ██████  ██      ██    ██   ████   █████   █████       
██      ██  ██  ██ ██      ██      ██    ██    ██    ██      ██          
███████ ██      ██ ██      ███████  ██████     ██    ███████ ███████     
                                                                         
                                                                         
███    ███  █████  ███    ██  █████   ██████  ███████ ██████             
████  ████ ██   ██ ████   ██ ██   ██ ██       ██      ██   ██            
██ ████ ██ ███████ ██ ██  ██ ███████ ██   ███ █████   ██████             
██  ██  ██ ██   ██ ██  ██ ██ ██   ██ ██    ██ ██      ██   ██            
██      ██ ██   ██ ██   ████ ██   ██  ██████  ███████ ██   ██            
                                                                                                                              
`)
);

const init = () => {
    inquirer 
        .prompt([
            {
                type: 'list',
                message: 'Please select from the following options:',
                name: 'initialize',
                choices: [
                    "View all department",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role",
                    "I'm finished"
                ]    
            }

        ])
        .then(ans => {
            switch (ans.initialize) {
                case 
                    "View all department": viewAllDepts();
                    break;
                case 
                    "View all roles": viewAllRoles();
                    break;
                case 
                    "View all employees": viewAllEmp();
                    break;
                case
                    "Add a department": addDept();
                    break;
                case 
                    "Add a role": addRole();
                    break;
                case 
                    "Add an employee": addEmp();
                    break;
                case 
                    "Update an employee role": updateEmp();
                    break;
                case 
                    "I'm finished":
                    console.log('Thanks for using Employee Tracker.');
                    process.exit();
                
            }
        })
}; 

init();

const viewAllDepts = () => {
    db.query(`SELECT * FROM department`, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
        }
        init();
    }); 
    
};

const viewAllRoles = () => {
    db.query(`SELECT * FROM roles`, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
        }
        init()
    }); 
    
};

const viewAllEmp = () => {
    db.query(`SELECT * FROM employees`, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            console.table(results);

        } 
        init()
    });
    
};

const addDept = () => {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the name of the department you'd like to add?",
                name: "addDept"
            }
        ]).then(ans => {
            db.query(`INSERT INTO department(name)
                    VALUES(?)`, ans.addDept, (err, results) => {
                if (err) {
                    console.log(err)
                } else {
                    db.query(`SELECT * FROM department`, (err, results) => {
                        err ? console.error(err) : console.table(results);
                        init();
                    })
                }
            }
            )
        })
};

const addRole = () => {
    const deptChoices = () => db.promise().query(`SELECT * FROM department`)
        .then((rows) => {
            let arrNames = rows[0].map(obj => obj.name);
            return arrNames
        })
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the title of the role you'd like to add?",
                name: "roleTitle"
            },
            {
                type: "input",
                message: "What is the salary for this role?",
                name: "roleSalary"
            },
            {
                type: "list",
                message: "Which department is this role in?",
                name: "addDept",
                choices: deptChoices
            }
        ]).then(ans => {
            db.promise().query(`SELECT id FROM department WHERE name = ?`, ans.addDept)
                .then(answer => {
                    let mappedId = answer[0].map(obj => obj.id);
                    // console.log(mappedId[0])
                    return mappedId[0]
                })
                .then((mappedId) => {
                    db.promise().query(`INSERT INTO roles(title, salary, department_id)
                VALUES(?, ?, ?)`, [ans.roleTitle, ans.roleSalary, mappedId]);
                    init()
                })
        })
};

const addEmp = () => {
    // const rollChoices = () => db.promise().query(`SELECT * FROM roles`)
    // .then((rows) => {
    //     let arrNames = rows[0].map(obj => obj.name);
    //     return arrNames
    // })
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the employee's first name?",
                name: "firstName"
            },
            {
                type: "input",
                message: "What is the employee's last name?",
                name: "lastName"
            },
            // {
            //     type: "list",
            //     message: "What is the employee's role?",
            //     name: "employeeRole",
            //     choices: rollChoices
            // }
        ]).then(ans => {
            db.query(`INSERT INTO employees(first_name, last_name)
                    VALUES(?, ?)`, [ans.firstName, ans.lastName], (err, results) => {
                if (err) {
                    console.log(err)
                } else {
                    db.query(`SELECT * FROM employees`, (err, results) => {
                        err ? console.error(err) : console.table(results);
                        init();
                    })
                }
            }
            )
        })
}

const updateEmp = () => {
  // Get a list of all employees to choose from
  db.promise().query(`SELECT * FROM employees`)
    .then(rows => {
      const empChoices = rows[0].map(obj => ({
        name: `${obj.first_name} ${obj.last_name}`,
        value: obj.id
      }));

      // Get a list of all roles to choose from
      db.promise().query(`SELECT * FROM roles`)
        .then(rows => {
          const roleChoices = rows[0].map(obj => ({
            name: obj.title,
            value: obj.id
          }));

          // Prompt the user to choose an employee and a new role
          inquirer.prompt([
            {
              type: 'list',
              message: 'Which employee do you want to update?',
              name: 'empId',
              choices: empChoices
            },
            {
              type: 'list',
              message: 'Which role do you want to assign to the employee?',
              name: 'roleId',
              choices: roleChoices
            }
          ]).then(ans => {
            // Update the employee's role in the database
            db.promise().query(`UPDATE employees SET role_id = ? WHERE id = ?`, [ans.roleId, ans.empId])
              .then(() => {
                console.log('Employee role updated successfully.');
                init();
              })
              .catch(err => console.error(err));
          });
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
};



