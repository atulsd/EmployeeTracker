const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const clear = require("clear");
const chalk = require("chalk");
const figlet = require("figlet");

const managerClass = require("./managerId");

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

function addDepartment() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "Enter department's name:",
      },
    ])
    .then((response) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: response.name,
        },
        function (err) {
          if (err) throw err;
          console.log("Your department was created successfully!");
          start();
        }
      );
    });
}

function viewRoles() {
  connection.query(
    "SELECT id as Role_Id,role_title as Role_Title,salary as Salary,department_id as Department_ID FROM role",
    function (err, res) {
      if (err) throw err;
      console.table(`\n\n`, res);
      start();
    }
  );
}

function addRole() {
  connection.query("SELECT * FROM department", function (err, departments) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "Enter role title:",
        },
        {
          name: "salary",
          type: "input",
          message: "Enter Salary:",
        },
        {
          name: "department",
          type: "rawlist",
          choices: function () {
            return (departmentList = departments.filter(
              (department) => department.name
            ));
          },
          message: "Please select department you want to add role in:",
        },
      ])
      .then((response) => {
        var departmentId;
        departments.forEach((department) =>
          department.name === response.department
            ? (departmentId = department.id)
            : null
        );
        connection.query(
          "INSERT INTO role SET ?",
          {
            role_title: response.title,
            salary: response.salary,
            department_id: departmentId,
          },
          function (err) {
            if (err) throw err;
            console.log("Your role was created successfully!");
            start();
          }
        );
      });
  });
}

function addEmployee() {
  connection.query("SELECT * FROM role", function (err, roles) {
    let managerList = [];
    connection.query("SELECT * FROM employee", function (err, emp) {
      if (err) throw err;
      //managerList = emp.filter((emp) => emp.first_name);
      for (var i = 0; i < emp.length; i++) {
        managerList.push(emp[i].first_name);
      }
      // emp.forEach((emp) => managerList.push(emp.first_name));
    });

    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "firstName",
          type: "input",
          message: "Enter First Name:",
        },
        {
          name: "lastName",
          type: "input",
          message: "Enter Last Name:",
        },
        {
          name: "role",
          type: "rawlist",
          choices: function () {
            var roleList = [];
            roles.forEach((role) => roleList.push(role.role_title));
            return roleList;
          },
          message: "Please select role of the employee:",
        },
        {
          name: "manager",
          type: "rawlist",
          choices: function () {
            return managerList;
          },
          message: "Please select manager of the employee:",
        },
      ])
      .then((response) => {
        var roleId;
        roles.forEach((role) =>
          role.role_title === response.role ? (roleId = role.id) : null
        );
        console.log("response.manager has the value: ", response.manager);

        connection.query("SELECT * FROM employee", function (err, emp) {
          let managerId;
          if (err) throw err;
          emp.forEach((emp) =>
            emp.first_name === response.manager ? (managerId = emp.id) : null
          );
          // const managerID = new managerClass(response.manager);
          // const managerId = managerID.getManagerid(emp);

          connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: response.firstName,
              last_name: response.lastName,
              role_id: roleId,
              manager_id: managerId,
            },
            function (err) {
              if (err) throw err;
              console.log("Employee added successfully!");
              start();
            }
          );
        });
      });
  });
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
