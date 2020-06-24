Use employees_db;

INSERT INTO department (name)
VALUES
    ('Sales'),
    ('Engineering'),
    ('Legal'),
    ('Finance');
    
INSERT INTO role (title, salary, department_id)
VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
	('Software Engineer', 120000, 2),
    ('Accountant', 125000, 4),
    ('Legal Team Lead', 250000, 3),
    ('Lawyer', 190000, 3);
    
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('John', 'Doe', 1, 3),
    ('Mike', 'Chan', 2, 1),
    ('Ashley', 'Rodriguez', 3, null),
	('Kevin','Tupik', 4, 3),
    ('Malia','Brown', 5, null ),
    ('Sarah','Lourd', 6, null),
    ('Tom','Alan', 7, 6);

/*
DROP DATABASE IF EXISTS employees_db;
CREATE database employees_db;

USE employees_db;

CREATE TABLE department (
  id INT NOT NULL auto_increment,
  name VARCHAR(30) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role (
  id INT NOT NULL auto_increment,
  title VARCHAR(30) NULL,
  salary decimal(8,2) NULL,
  department_id int NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
  id INT NOT NULL auto_increment,
  first_name VARCHAR(30) NULL,
  last_name VARCHAR(30) NULL,
  role_id int NOT NULL,
  manager_id INT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES role(id),
  FOREIGN KEY (manager_id) REFERENCES role(id)
);
/*