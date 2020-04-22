const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const clear = require("clear");
const chalk = require("chalk");
const figlet = require("figlet");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port;
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "employeedb",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log(`Connection id is: ${connection.threadId}`);
  clearScreen();
  start();
});

function clearScreen() {
  clear();
  console.log(
    chalk.greenBright(
      figlet.textSync("Employee Tracker", { horizontalLayout: "full" })
    )
  );
}

function start() {
  inquirer
    .prompt({
      name: "menu",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Departments",
        "View All Roles",
        "O- View All Employees by Department",
        "O- View All Employees by Manager",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Update Employee Role",
        "O- Remove Employee",
        "O- Remove Role",
        "O- Remove Department",
        "O- Update Employee Manager",
        "O- View Total Utilized Budget of a Department",
        "Exit",
      ],
    })
    .then(function (answer) {
      switch (answer.menu) {
        case "View All Employees":
          viewEmployees();
          break;

        case "View All Departments":
          viewDepartments();
          break;

        case "View All Roles":
          viewRoles();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Exit":
          stop();
          break;
      }
    });
}

function viewEmployees() {
  connection.query(
    `Select employee.id as Employee_Id,first_name as First_Name,last_name as Last_Name,name as Department_Name,role_title as Title,salary as Salary from department inner join employee on employee.role_id=department.id inner join role on role.department_id=department.id`,
    function (err, res) {
      let detail = res;
      let manager = [];
      if (err) throw err;
      connection.query(`Select * from employee`, function (err, res) {
        if (err) throw err;
        for (const employee in res) {
          const managerId = res[employee].manager_id;
          for (const employee in res) {
            if (managerId === res[employee].id) {
              manager.push(
                res[employee].first_name + " " + res[employee].last_name
              );
            } else {
              manager.push("null");
            }
          }
          console.log(res[employee]);
          console.log(manager);
        }
      });
      detail += manager;
      console.table(`\n\n`, res, manager);
    }
  );
  start();
}

function viewDepartments() {
  connection.query(
    "SELECT id as Department_Id, name as Department_Name FROM department",
    function (err, res) {
      if (err) throw err;
      console.table(`\n\n`, res);
      start();
    }
  );
}

function stop() {
  console.log(
    chalk.greenBright(
      figlet.textSync("Thanks", {
        horizontalLayout: "full",
      })
    )
  );
  connection.end();
  process.exit(0);
}
