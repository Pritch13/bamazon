var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazonDB"
});

function displayItems() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            console.log('\n ID: ' + res[i].item_id + '\n Name: ' + res[i].product_name + '\n Price: ' + res[i].price + '\n');
        }
        whatToBuy();
    });
}

function update() {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: answers.bid
            },
            {
                item_id: chosenItem.id
            }
        ],
        function (error) {
            if (error) throw err;
            console.log('\n Processing you order and updating inventory! \n\n Thankyou for shopping with Bamazon! \n');
            connection.end();
        }
    );
}

function whatToBuy() {
    connection.query("SELECT * FROM products", function (err, res) {
        inquirer.prompt([
            {
                type: "input",
                message: "Which product would you like to purchase? (Please enter the ID number)",
                name: 'idSelect',
                validate: function (value) {
                    if (isNaN(value) === false && value) {
                        return true;
                    }
                    return false;
                }
            },
            {
                type: "input",
                message: "How many units would you like to order?",
                name: 'unitSelect',
                validate: function (value) {
                    if (isNaN(value) === false && value) {
                        return true;
                    }
                    return false;
                }
            }

        ]).then(answers => {

            var itemIdSelected = parseFloat(answers.idSelect);
            var quantitySelected = parseFloat(answers.unitSelect);


            connection.query("SELECT * FROM products", function (err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                    if (parseInt(answers.idSelect) === res[i].item_id) {
                        console.log('\n Checking our ' + res[i].product_name + ' inventory...');

                        if (parseInt(answers.unitSelect) <= res[i].stock_quantity) {
                            console.log('\n We have enough in stock! \n');
                            var quantTotal = res[i].stock_quantity - quantitySelected;
                            inquirer.prompt([
                                {
                                    type: "confirm",
                                    message: 'Are you sure you want to buy ' + answers.unitSelect + ' ' + res[i].product_name + "'s?",
                                    name: 'confirm'
                                }
                            ]).then(answers => {
                                if (!answers.confirm) {
                                    console.log('\n Perhaps you would like to buy another item... \n');
                                    whatToBuy();
                                } else if (answers.confirm) {
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
                                            console.log('\n Processing you order and updating inventory! \n\n Thankyou for shopping with Bamazon! \n');
                                            connection.end();
                                        }
                                    );
                                }
                            });

                        }
                        if (res[i].stock_quantity < parseInt(answers.unitSelect)) {
                            console.log("\n Sorry we don't have enough of that product, please select again! \n ");
                            whatToBuy();
                        }
                    }
                }

            });

        });
    });
}





connection.connect(function (err) {
    if (err) throw err;
    displayItems();
});