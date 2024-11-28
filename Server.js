import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import session from "express-session";

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

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

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

    if (req.session.role === "admin") {
        res.render("userprofile.ejs", { record: foundRecord });
    } else if (req.session.role === "user") {
        res.render("user edit.ejs", { record: foundRecord });
    } else {
        res.redirect("/");
    }


});

app.post("/login", async (req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password.trim();
    const response = await db.query("SELECT * FROM user_list");
    const result = response.rows;

    for (const account of result) {

        if (username !== '' && username === account.email) {

            if (password != '' && password === account.password) {

                if (account.role === "admin") {
                    req.session.role = "admin";

                    return res.render("admin page.ejs", {
                        details: account
                    });

                } else {
                    req.session.role = "user";

                    return res.render("user page.ejs", { details: account });

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
            "INSERT INTO user_list (name, email, user_id, password, role, status) VALUES ($1, $2, $3, $4, $5, $6)",
            [name, email, userId, password, role, status]
        );

        res.json("Account created sucessfully");
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

        res.redirect(`/edit/${id}`);

    } else {
        res.send("Account not found")
    }
});

app.post("/log-out", (req, res) => {
    res.redirect("/");
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