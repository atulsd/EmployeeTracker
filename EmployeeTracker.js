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
        "View All Employees by Department",
        "O- View All Employees by Manager",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Update Employee Role",
        "Remove Employee",
        "O- Remove Role",
        "O- Remove Department",
        "Update Employee Manager",
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

        case "Remove Employee":
          removeEmployee();
          break;

        case "Update Employee Manager":
          updateEmployeeManager();
          break;

        case "View All Employees by Department":
          viewEmployeesByDepartment();
          break;

        case "Exit":
          stop();
          break;
      }
    });
}

function viewEmployees() {
  connection.query(
    `SELECT e.id as Employee_ID,e.first_name as First_Name,e.last_name as Last_Name,
     role.role_title as Role_Title,
     department.name as Department,
     role.salary as Salary,
     concat(m.first_name," ",m.last_name) as Manager
     FROM employeedb.employee e
     left join employeedb.employee m on m.id = e.manager_id
     join role on role.id=e.role_id
     join department on role.department_id=department.id
     order by e.id asc`,
    function (err, res) {
      if (err) throw err;
      console.table(`\n\n`, res);
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
    if (err) throw err;

    let managerList = ["None"];
    connection.query("SELECT * FROM employee", function (err, emp) {
      if (err) throw err;
      //managerList = emp.filter((emp) => emp.first_name);
      for (var i = 0; i < emp.length; i++) {
        managerList.push(emp[i].first_name);
      }
      // emp.forEach((emp) => managerList.push(emp.first_name));
    });

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
          choices: managerList,
          message: "Please select manager of the employee:",
        },
      ])
      .then((response) => {
        var roleId;
        roles.forEach((role) =>
          role.role_title === response.role ? (roleId = role.id) : null
        );

        connection.query("SELECT * FROM employee", function (err, emp) {
          let managerId;
          if (err) throw err;
          emp.forEach((emp) =>
            emp.first_name === response.manager ? (managerId = emp.id) : null
          );
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
            }
          );
          console.log("Manager is: ", response.manager);
          console.log("Employee added successfully!");
          start();
        });
      });
  });
}

function updateEmployeeRole() {
  connection.query("SELECT * FROM employee", function (err, emp) {
    if (err) throw err;
    let roleList = [];
    connection.query("SELECT * FROM role", function (err, role) {
      if (err) throw err;
      //managerList = emp.filter((emp) => emp.first_name);
      for (var i = 0; i < role.length; i++) {
        roleList.push(role[i].role_title);
      }
      // emp.forEach((emp) => managerList.push(emp.first_name));
    });

    inquirer
      .prompt([
        {
          name: "getEmployee",
          type: "rawlist",
          choices: function () {
            var empList = [];
            emp.forEach((employee) =>
              empList.push(employee.first_name + " " + employee.last_name)
            );
            return empList;
          },
          message: "Which employee's role do you want to change?:",
        },
        {
          name: "role",
          type: "rawlist",
          choices: roleList,
          message: "Please select new role:",
        },
      ])
      .then((response) => {
        let empId;
        emp.forEach((emp) =>
          emp.first_name + " " + emp.last_name === response.getEmployee
            ? (empId = emp.id)
            : null
        );
        console.log("Employee Id is: ", empId);
        connection.query("SELECT * FROM role", function (err, role) {
          let roleId;
          if (err) throw err;
          role.forEach((role) =>
            role.role_title === response.role ? (roleId = role.id) : null
          );
          connection.query(
            "UPDATE employee SET ? WHERE ?",
            [
              {
                role_id: roleId,
              },
              {
                id: empId,
              },
            ],
            function (err) {
              if (err) throw err;
              console.log("Employee's role updated successfully!");
              start();
            }
          );
        });
      });
  });
}

function removeEmployee() {
  connection.query("SELECT * FROM employee", function (err, emp) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "getEmployee",
          type: "rawlist",
          choices: function () {
            var empList = [];
            emp.forEach((employee) =>
              empList.push(employee.first_name + " " + employee.last_name)
            );
            return empList;
          },
          message: "Which employee do you want to remove?:",
        },
      ])
      .then((response) => {
        let empId;
        emp.forEach((emp) =>
          emp.first_name + " " + emp.last_name === response.getEmployee
            ? (empId = emp.id)
            : null
        );
        console.log("Employee Id is: ", empId);
        connection.query(
          "Delete from employee WHERE ?",
          [
            {
              id: empId,
            },
          ],
          function (err) {
            if (err) throw err;
            console.log("Employee removed successfully!");
            start();
          }
        );
      });
  });
}

async function updateEmployeeManager() {
  try {
    connection.query("SELECT * FROM employee", async function (err, emp) {
      let empId;
      if (err) throw err;
      await inquirer
        .prompt([
          {
            name: "getEmployee",
            type: "rawlist",
            choices: function () {
              var empList = [];
              emp.forEach((employee) =>
                empList.push(employee.first_name + " " + employee.last_name)
              );
              return empList;
            },
            message: "Which employee's manager do you want to update?:",
          },
        ])
        .then((response) => {
          emp.forEach((emp) =>
            emp.first_name + " " + emp.last_name === response.getEmployee
              ? (empId = emp.id)
              : null
          );
        });

      await inquirer
        .prompt([
          {
            name: "setManager",
            type: "rawlist",
            choices: function () {
              var empList = [];
              emp.forEach((employee) => {
                if (!(parseInt(employee.id) === parseInt(empId)))
                  empList.push(employee.first_name + " " + employee.last_name);
              });
              return empList;
            },
            message:
              "Which employee do you want to set as manager for the selected employee?:",
          },
        ])
        .then((response) => {
          let managerId;
          emp.forEach((emp) =>
            emp.first_name + " " + emp.last_name === response.setManager
              ? (managerId = emp.id)
              : null
          );
          console.log("Employee Id is: ", empId);
          connection.query(
            "UPDATE employee SET ? WHERE ?",
            [
              {
                manager_id: managerId,
              },
              {
                id: empId,
              },
            ],
            function (err) {
              if (err) throw err;
              console.log("Employee's manager updateed successfully!");
              start();
            }
          );
        });
    });
  } catch (err) {
    console.log("Can not read properties.");
  }
}

function viewEmployeesByDepartment() {
  connection.query(
    `Select d.id as Department_ID,d.name as Department_Name,
    e.first_name as First_Name,e.last_name as Last_Name,
    role.role_title as Role_Title
    from department d
    join role on role.department_id=d.id
    join employeedb.employee e on e.role_id=role.id
    order by d.id`,
    function (err, res) {
      if (err) throw err;
      console.table(`\n\n`, res);
    }
  );
  start();
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
