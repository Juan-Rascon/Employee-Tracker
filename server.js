const inquirer = require ('inquirer');
const mysql = require("mysql");
const cTable = require('console.table');



// SQL Connections and Queries 
//--------------------------------------------------------------------
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Movies@20",
  database: "employees_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});


function ViewTable(column,table) {
  return new Promise ((resolve, reject)=>{
    connection.query(
      'SELECT ?? FROM ??', [column,table], function(err, res) {
        if (err) {
        reject(err);
        }
        else {
          const table = cTable.getTable(res);
          resolve(table)
        }
      });
    });
}


function ViewAllEmployees() {
  return new Promise ((resolve, reject)=>{
    connection.query(
      "SELECT e.id AS employee_id, e.first_name, e.last_name, d.name AS department_name, r.title AS job_title, r.salary, CONCAT(f.first_name, ' ', f.last_name) AS manager_name " +
      "FROM employee e "+
      "LEFT JOIN role r ON e.role_id = r.id "+
      "LEFT JOIN department d ON d.id = r.department_id "+
      "LEFT JOIN employee f ON e.manager_id = f.id", function(err, res) {
        if (err) {
        reject(err);
        }
        else {
          const table = cTable.getTable(res);
          resolve(table)
        }
      });
    });
}


function addItems(query){
  return new Promise ((resolve, reject) =>{
    connection.query(query, function(err, res) {
      if (err) {
        reject(err);
        }
      else {
        resolve(res);
      }
    });
});
}
   
function getRoles() {
return new Promise ((resolve, reject)=>{
  connection.query(
    "SELECT title FROM role", 
    function(err, res) {
      if (err) {
        reject(err);
      }
      else {
        const role = res.map(role => role.title);
        resolve(role);
      };
    })
  })
};
   
function getEmployees() {
  return new Promise ((resolve, reject)=>{
  connection.query(
    "SELECT first_name, last_name FROM employee", 
    function(err, res) {
      if (err) {
        reject(new Error ('Something went wrong'));
      }
      else {
        const emps = res.map(emp => emp.first_name + " " + emp.last_name);
        resolve(emps);
      }
    })
  })
};

function getDept() {
  return new Promise ((resolve, reject)=>{
  connection.query(
    "SELECT name FROM department", 
    function(err, res) {
      if (err) {
        reject(new Error ('Something went wrong'));
      }
      else {
        const dept = res.map(val => val.name);
        // console.log (dept);
        resolve(dept);
      }
    })
  })
};
 
//-----------------MAIN INQUIRER------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------
function ask() {
  inquirer.prompt(start).then(answers => {

    switch(answers.action) {
      case 'View All Employees':
        ViewAllEmployees().then(result => {
        console.log(result)
        ask();}).catch(error=> console.log(error))
        break;
      case 'View All Departments':
        ViewTable('name','department').then(result => {
        console.log(result)
        ask();}).catch(error=> console.log(error));
        break;
      case 'View All Roles':
        ViewTable('title','role').then(result => {
        console.log(result)
        ask();}).catch(error=> console.log(error));
        break;
      case 'Add Employee':
        inquirer.prompt(addEmployee).then(answers => {

          let sqlquery ="INSERT INTO employee (first_name, last_name, role_id, manager_id) "+
           "VALUES (?, ?, (SELECT id FROM role WHERE title = ?),(SELECT id FROM (SELECT * FROM employee) as emp2 WHERE first_name = ? AND last_name = ?))";

          const Empname = answers.empManager.split(" ");

          let inserts = [answers.firstName, answers.lastName, answers.empRole, Empname[0], Empname[Empname.length -1]];
          sqlquery = mysql.format(sqlquery, inserts);

          addItems(sqlquery).then(result => {
            console.log('\n'+ "Employee: " + answers.firstName + " "+ answers.lastName + ' has been added. \n');
            ask()}).catch(err => console.log(err));
        })
      break;
      case 'Update Employee Role':
        inquirer.prompt(updateEmployeeRole).then(answers => {

          let sqlquery ="UPDATE employee SET role_id = (select id from role where title = ?) "+
           "WHERE id = (SELECT id FROM (SELECT * FROM employee) as emp2 WHERE first_name = ? AND last_name = ?);";

          const Empname = answers.empToUpdate.split(" ");

          let inserts = [answers.selectRole, Empname[0], Empname[Empname.length -1]];
          sqlquery = mysql.format(sqlquery, inserts);

          addItems(sqlquery).then(result => {
            console.log('\n'+ "Role for " + answers.empToUpdate +' has been updated. \n');
            ask()}).catch(err => console.log(err));
        })
        break;
      case 'Add Department':
        let sqlquery = "INSERT INTO department (name) VALUES (?)";

        let inserts = [answers.addDept];
        sqlquery = mysql.format(sqlquery, inserts);

        addItems(sqlquery).then(result => {
          console.log('\n'+ 'Department has been added. \n')
          ask()}).catch(err => console.log(err));
        break;
      case 'Add Role':
        inquirer.prompt(AddNewRole).then(answers => {

          let sqlquery ="INSERT INTO role (title, salary, department_id) VALUES (?, ?, (SELECT id FROM department WHERE name = ?))";

          let inserts = [answers.addRole, parseInt(answers.addSalary), answers.deptSelect];
          sqlquery = mysql.format(sqlquery, inserts);

          addItems(sqlquery).then(result => {
            console.log('\n'+ "The role " + answers.addRole + " has been added to " + answers.deptSelect + '\n');
            ask()}).catch(err => console.log(err));
          })
        break;
      case 'Exit':
        connection.end();  
        break;
      default:
        ask();
        break;
  }
})
};

const start = [
  {
      type: 'list',
      name: 'action',
      message: "What would you like to do?",
      choices: [
      'View All Employees', 
      'View All Departments',
      'View All Roles',
      'Add Employee',
      'Add Department',
      'Add Role',
      'Update Employee Role',
      'Exit'],
      pageSize:10
    },
    {
      type: 'input',
      name: 'addDept',
      message: "Enter department to add:",
      when : (answers) => {
        return answers.action === 'Add Department';
      }
    }, 
]

//Add new Role Questions:
const AddNewRole = [
{
  type: 'list',
  name: 'deptSelect',
  message: "Select Department to add role to:",
  choices: async () => await getDept().then(result => result),
},
{
  type: 'input',
  name: 'addRole',
  message: "Enter role to add:",
},
{
  type: 'input',
  name: 'addSalary',
  message: "Enter salary for new role:"
},
]

//UPDATE Employee Role Questions
const updateEmployeeRole= [
{
    type: 'list',
    name: 'empToUpdate',
    message: "Which employee do you want to update?",
    choices: async () => await getEmployees().then(result => result),
    pageSize: 10,
},
{
  type: 'list',
  name: 'selectRole',
  message: "Please select new role:",
  choices: async () => await getRoles().then(result => result),
  pageSize: 10,
}
]

//ADD NEW Employee Questions
const addEmployee = [
  {
    type: 'input',
    name: 'firstName',
    message: "Please enter employee's first name:"
  },
  {
    type: 'input',
    name: 'lastName',
    message: "Please enter employee's last name:"
  },
  {
    type: 'list',
    name: 'empRole',
    message: "Please choose role for employee:",
    choices: async () => await getRoles().then(result => result),
    pageSize: 10,
  },
  {
    type: 'list',
    name: 'empManager',
    message: "Please choose manager for employee:",
    choices: async () => await getEmployees().then(result => result),
    pageSize: 10,
  }
]

ask();