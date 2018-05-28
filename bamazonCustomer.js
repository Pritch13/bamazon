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

function whatToBuy() {
    inquirer.prompt([
        {
            type: "input",
            message: "Which product would you like to purchase? (Please enter the ID number)",
            name: 'idSelect'
        },
        {
            type: "input",
            message: "How many units would you like to order?",
            name: 'unitSelect'
        }
    ]).then(answers => {
        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;
            for (let i = 0; i < res.length; i++) {
                if (parseInt(answers.idSelect) === res[i].item_id) {
                    console.log('Checking our ' + res[i].product_name + ' inventory...');

                    if (parseInt(answers.unitSelect) <= res[i].stock_quantity) {
                        console.log('\n We have enough in stock! \n');
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
                            } else {
                                console.log('\n Processing you order and updating inventory! \n\n Thankyou for shopping with Bamazon \n');
                                connection.end();
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
}




connection.connect(function (err) {
    if (err) throw err;
    displayItems();
});