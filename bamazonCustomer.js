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
                    console.log(res[i].product_name);

                    if (parseInt(answers.unitSelect) <= res[i].stock_quantity) {
                        console.log('We have enough!');

                    }
                    if (res[i].stock_quantity < parseInt(answers.unitSelect)) {
                        console.log("Sorry we don't have enough of that product, please select again!");
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