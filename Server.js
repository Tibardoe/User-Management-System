import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
});

db.connect();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

function idGen() {
    const randomId = Math.floor(Math.random() * 1000000);
    return randomId
};

app.get("/", (req, res) => {
    res.render("index.ejs")
});

app.get("/userlist", async (req, res) => {
    const response = await db.query("SELECT * FROM user_list");
    const result = response.rows;

    res.render("user list.ejs", { userList: result });
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const response = await db.query("SELECT * FROM user_list");
    const result = response.rows;
    result.forEach(account => {
        if (username != '' && username === account.email) {
            console.log("user exist");

            if (password != '' && password === account.password) {

                console.log("password is correct");

                if (account.role === "admin") {

                    res.render("admin page.ejs", {
                        details: account
                    });

                } else {

                    res.render("user page.ejs");

                }

            } else {
                res.json("Password incorrect!")
            }

        } else {
            res.json("Username not found!")
        }
    });


});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});