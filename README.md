# manage-gadgets-api
Backend API of Manage Gadgets

## Starting the API Server

```docker compose up```

Note that this will also start a MySQL database server along with the API service. 

Follow the steps below to setup the database with necessary tables.

- exec into the mysql docker container 
- execute ```mysqul -u root -p``` and enter the default password ```root```
- create a database named **manage_gadget** ```create database manage_gadget```
- import the database schema ```dbscript.sql```


## Sample Request

```
HTTP /POST

query GetRepairs {
    getRepairs {
        totalCount
    }
}
```