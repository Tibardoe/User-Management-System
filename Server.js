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

app.get("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await db.query("SELECT * FROM user_list");
    const result = response.rows;
    const foundRecord = result.find(record => id === record.id);

    res.render("userprofile.ejs", { record: foundRecord });
});

app.post("/login", async (req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password.trim();
    const response = await db.query("SELECT * FROM user_list");
    const result = response.rows;


    for (const account of result) {

        if (username !== '' && username === account.email) {
            console.log("user exist");

            if (password != '' && password === account.password) {

                console.log("password is correct");

                if (account.role === "admin") {

                    return res.render("admin page.ejs", {
                        details: account
                    });

                } else {

                    return res.render("user page.ejs", { record: account });

                }

            } else {
                return res.json("Password incorrect!")
            }

        }
    }

    if (!userFound) {
        return res.json("Username not found!");
    }
});

app.post("/signup", async (req, res) => {
    const userId = idGen();
    const name = req.body.name;
    const role = "user";
    const status = 'Inactive'
    const email = req.body.email;
    const password = req.body.password;
    const response = await db.query("SELECT * FROM user_list");
    const result = response.rows;
    const foundRecord = result.find(record => record.email === email && record.password === password);
    if (foundRecord) {
        res.send("User already exist!")
    } else {
        const creatAccount = await db.query(
            "INSERT INTO user_list (name, email, user_id, password, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [name, email, userId, password, role, status]
        );

        const account = creatAccount.rows;

        res.render("user page.ejs", { account: account[0] });
    }

});

app.post("/save/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const name = req.body.name;
    const email = req.body.email;
    const gender = req.body.gender;
    const password = req.body.password;
    const role = req.body.role;
    const response = await db.query("SELECT * FROM user_list");
    const result = response.rows;
    const foundRecord = result.find(record => id === record.id);

    if (foundRecord) {
        await db.query(
            "UPDATE user_list SET name = $1, email = $2, gender = $3, password = $4, role = $5 WHERE id = $6",
            [name, email, gender, password, role, id]
        );

        res.render("user list.ejs", { userList: result });

    } else {
        res.send("Account not found")
    }
});

app.post("/delete/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await db.query("SELECT * FROM user_list");
    const result = response.rows;
    const foundRecord = result.find(record => id === record.id);
    if (foundRecord) {
        await db.query("DELETE FROM user_list WHERE id = $1", [id]);
    } else {
        res.send("User not found")
    }
    res.redirect("/userlist");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});