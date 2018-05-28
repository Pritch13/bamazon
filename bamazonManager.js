var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazonDB"
});

function managerQuestion() {
    inquirer.prompt({
        name: "managerStart",
        type: "list",
        message: "Main menu",
        choices: ["View Products for Sale", "View Low Inventory", "Add Inventory", "Add New Product"]
    }).then(answers => {
        if (answers.managerStart === "View Products for Sale") {
            console.log('\n Displaying all products in inventory: \n');
            displayItems();
        } else if (answers.managerStart === "View Low Inventory") {
            console.log('\n Displaying all products with low inventory: \n');
            lowInventory();
        } else if (answers.managerStart === "Add to Inventory") {
            console.log('\n Add new inventory to existing items: \n');
            addInventory();
        } else if (answers.managerStart === "Add New Product") {
            console.log('\n Add a new item to your inventory: \n');
            addItem();
        }
    });
}

function displayItems() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            console.log('\n ID: ' + res[i].item_id + '\n Name: ' + res[i].product_name + '\n Price: ' + res[i].price + '\n Stock quantity: ' + res[i].stock_quantity + '\n Department: ' + res[i].department_name + '\n');
        }
        managerQuestion();
    });
}

function lowInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 20) {
                console.log('\n ID: ' + res[i].item_id + '\n Name: ' + res[i].product_name + '\n Price: ' + res[i].price + '\n Stock quantity: ' + res[i].stock_quantity + '\n Department: ' + res[i].department_name + '\n');
            }
        }
        managerQuestion();
    });
}

function addInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
    inquirer.prompt([
        {
            type: "input",
            message: "What item would you like to add inventory to? (By ID number)",
            name: 'itemSelect',
            validate: function (value) {
                for (let i = 0; i < res.length; i++) {
                    if (parseFloat(value) == res[i].item_id) {
                        return true;
                    }
                }

            }
        },
        {
            type: "input",
            message: "How much inventory do you want to add?",
            name: 'itemSelect',
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                return false;
              }
        }
    ]).then(answers => {
        if(answers.itemSelect > 0) {
            connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: quantTotal
                    },
                    {
                        item_id: itemIdSelected
                    }
                ],
                function (error) {
                    if (error) throw err;
                    console.log('\n Inventory updated! \n');
                    displayItems();
                }
            );
        }
    });
});
}

function addItem() {
    inquirer.prompt([
            {
                name: "item",
                type: "input",
                message: "What is the item name?"
            },
            {
                name: "category",
                type: "input",
                message: "What department does the item belong in?"
            },
            {
                name: "price",
                type: "input",
                message: "What price is the item?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "initStock",
                type: "input",
                message: "What is the stock quantity of the new item?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.item,
                    department_name: answer.category,
                    price: answer.price,
                    stock_quantity: answer.initStock
                },
                function (err) {
                    if (err) throw err;
                    console.log("\n Your item was added successfully! \n");
                    managerQuestion();
                }
            );
        });
}





connection.connect(function (err) {
    if (err) throw err;
    managerQuestion();
});