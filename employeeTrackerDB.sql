-- * **department**:
--   * **id** - INT PRIMARY KEY
--   * **name** - VARCHAR(30) to hold department name

DROP DATABASE IF EXISTS employeeDB;
CREATE DATABASE employeeDB;
USE employeeDB;

create table department(
    id int not null auto_increment,
	name varchar(30),
    primary key(id)
);

Insert into department(name)
values ("I.T."),("Business"),("Management"),("Delivery"),("Cleaning");

Select * from department;

-- * **role**:
--   * **id** - INT PRIMARY KEY
--   * **title** -  VARCHAR(30) to hold role title
--   * **salary** -  DECIMAL to hold role salary
--   * **department_id** -  INT to hold reference to department role belongs to

create table role(
	id int auto_increment not null,
    role_title varchar(30),
    salary decimal(10,2),
    department_id int,
    foreign key(department_id) references department(id) ON DELETE CASCADE,
    primary key(id)
);

insert into role(role_title,salary,department_id)
values("Manager",10000.00,1),("Supervisor",8000.00,1),("Receptionist",7000.00,2),
("Factory Hand",6000.00,5),("Delivery Man",5000.00,4);

Select * from role;

-- * **employee**:

--   * **id** - INT PRIMARY KEY
--   * **first_name** - VARCHAR(30) to hold employee first name
--   * **last_name** - VARCHAR(30) to hold employee last name
--   * **role_id** - INT to hold reference to role employee has
--   * **manager_id** - INT to hold reference to another employee that manager of the current employee. This field may be null if the employee has no manager
 
create table employee(
	id int not null auto_increment,
    first_name varchar(30),
    last_name varchar(30),
    role_id int,
    manager_id int default null,
    foreign key(role_id) references role(id) ON DELETE CASCADE,
    foreign key(manager_id) references employee(id) ON DELETE CASCADE,
    primary key(id)
);

insert into employee(first_name,last_name,role_id,manager_id)
values ("Atul","Mahajan",1,null),("John","Smith",2,1),("Dane","Smith",3,null),("John","Maarshall",4,null),("Wayne","Marshall",5,null);

Select * from employee;
