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
        "View All Employees by Manager",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Update Employee Role",
        "Remove Employee",
        "Remove Role",
        "Remove Department",
        "Update Employee Manager",
        "View Total Utilized Budget of a Department",
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

        case "View All Employees by Manager":
          viewEmployeesByManager();
          break;

        case "View Total Utilized Budget of a Department":
          viewTotalUtilizedBudget();
          break;

        case "Remove Role":
          removeRole();
          break;

        case "Remove Department":
          removeDepartment();
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
      start();
    }
  );
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
          console.log("\n\nYour department was created successfully!\n\n");
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
            console.log("\n\nYour role was created successfully!\n\n");
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
      emp.forEach((emp) =>
        managerList.push(emp.first_name + " " + emp.last_name)
      );
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
            emp.first_name + " " + emp.last_name === response.manager
              ? (managerId = emp.id)
              : null
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
          console.log("\n\nEmployee added successfully!\n\n");
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
      role.forEach((role) => roleList.push(role.role_title));
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
              console.log("\n\nEmployee's role updated successfully!\n\n");
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
        connection.query(
          "Delete from employee WHERE ?",
          [
            {
              id: empId,
            },
          ],
          function (err) {
            if (err) throw err;
            console.log("\n\nEmployee removed successfully!\n\n");
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
              console.log("\n\nEmployee's manager updated successfully!\n\n");
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
  connection.query("SELECT * FROM department", function (err, dep) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "getDepartment",
          type: "rawlist",
          choices: function () {
            var departmentList = [];
            dep.forEach((department) => departmentList.push(department.name));
            return departmentList;
          },
          message: "Which department you want to view employee from?:",
        },
      ])
      .then((response) => {
        let depId;
        dep.forEach((dep) =>
          dep.name === response.getDepartment ? (depId = dep.id) : null
        );
        connection.query(
          `Select d.id as Department_ID,d.name as Department_Name,
            e.first_name as First_Name,e.last_name as Last_Name,
            role.role_title as Role_Title
            from department d
            join role on role.department_id=d.id
            join employeedb.employee e on e.role_id=role.id
            where d.id=?`,
          [depId],
          function (err, res) {
            if (err) throw err;
            if (res.length > 0) {
              console.table(`\n\n`, res);
            } else {
              console.log(
                chalk.greenBright(
                  figlet.textSync("\n\nNO DATA....", {
                    horizontalLayout: "full",
                  })
                )
              );
            }
            start();
          }
        );
      });
  });
}

function viewEmployeesByManager() {
  connection.query("SELECT * FROM employee", function (err, emp) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "getManager",
          type: "rawlist",
          choices: function () {
            var empList = [];
            emp.forEach((employee) => {
              empList.push(employee.first_name + " " + employee.last_name);
            });
            return empList;
          },
          message: "Which manager's employees do you want to view?:",
        },
      ])
      .then((response) => {
        let managerId;
        emp.forEach((emp) =>
          emp.first_name + " " + emp.last_name === response.getManager
            ? (managerId = emp.id)
            : null
        );
        connection.query(
          `SELECT 
          e.manager_id as Manager_ID,
          concat(m.first_name," ",m.last_name) as Manager,
          e.first_name as First_Name,e.last_name as Last_Name,
          role.role_title as Role_Title,
          department.name as Department,
          role.salary as Salary
          FROM employeedb.employee e
          left join employeedb.employee m on m.id = e.manager_id
          join role on role.id=e.role_id
          join department on role.department_id=department.id
          where e.manager_id=?
          order by e.id asc`,
          [managerId],
          function (err, res) {
            if (err) throw err;
            if (res.length > 0) {
              console.table(`\n\n`, res);
            } else {
              console.log(
                chalk.greenBright(
                  figlet.textSync("\n\nNO DATA....", {
                    horizontalLayout: "full",
                  })
                )
              );
            }
            start();
          }
        );
      });
  });
}

function viewTotalUtilizedBudget() {
  connection.query("SELECT * FROM department", function (err, dep) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "getDepartment",
          type: "rawlist",
          choices: function () {
            var departmentList = [];
            dep.forEach((department) => departmentList.push(department.name));
            return departmentList;
          },
          message: "Which department you want to view utilized budget from?:",
        },
      ])
      .then((response) => {
        let depId;
        dep.forEach((dep) =>
          dep.name === response.getDepartment ? (depId = dep.id) : null
        );

        connection.query(
          `Select d.id as Department_ID,d.name as Department_Name,
          Sum(role.salary) as Utilized_Budget
          from department d
          join role on role.department_id=d.id
          join employeedb.employee e on e.role_id=role.id
          where d.id=?
          group by d.id`,
          [depId],
          function (err, res) {
            if (err) throw err;
            if (res.length > 0) {
              console.table(`\n\n`, res);
            } else {
              console.log(
                chalk.greenBright(
                  figlet.textSync("\n\nNO DATA....", {
                    horizontalLayout: "full",
                  })
                )
              );
            }
            start();
          }
        );
      });
  });
}

function removeRole() {
  connection.query("SELECT * FROM role", function (err, role) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "getRole",
          type: "rawlist",
          choices: function () {
            var roleList = [];
            role.forEach((role) => roleList.push(role.role_title));
            return roleList;
          },
          message: "Which role do you want to remove?:",
        },
      ])
      .then((response) => {
        let roleId;
        role.forEach((role) =>
          role.role_title === response.getRole ? (roleId = role.id) : null
        );
        connection.query(
          "Delete from role WHERE ?",
          [
            {
              id: roleId,
            },
          ],
          function (err) {
            if (err) {
              console.log(
                chalk.greenBright(
                  figlet.textSync("Can't Remove this Role", {
                    horizontalLayout: "full",
                  })
                )
              );
              console.log(
                "\n\nPlease remove employees under this role first......\n\n"
              );
            } else {
              console.log("\n\nRole removed successfully!\n\n");
            }
            start();
          }
        );
      });
  });
}

function removeDepartment() {
  connection.query("SELECT * FROM department", function (err, dep) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "getDepartment",
          type: "rawlist",
          choices: function () {
            var departmentList = [];
            dep.forEach((department) => departmentList.push(department.name));
            return departmentList;
          },
          message: "Which department do you want to remove?:",
        },
      ])
      .then((response) => {
        let departmentId;
        dep.forEach((department) =>
          department.name === response.getDepartment
            ? (departmentId = department.id)
            : null
        );
        connection.query(
          "Delete from department WHERE ?",
          [
            {
              id: departmentId,
            },
          ],
          function (err) {
            if (err) {
              console.log(
                chalk.greenBright(
                  figlet.textSync("Can't Remove this Dep", {
                    horizontalLayout: "full",
                  })
                )
              );
              console.log(
                "\n\nPlease remove roles under this department first......\n\n"
              );
            } else {
              console.log("\n\nDepartment removed successfully!\n\n");
            }
            start();
          }
        );
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
