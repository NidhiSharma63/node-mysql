const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const url = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQL_ROOT_PASSWORD}@${process.env.RAILWAY_TCP_PROXY_DOMAIN}:${process.env.RAILWAY_TCP_PROXY_PORT}/${process.env.MYSQL_DATABASE}`;

console.log({ url });
const connection = mysql.createConnection(url);

connection.connect((err) => {
	if (err) {
		console.log(err);
		return;
	}
	console.log("mysql connected");
});

app.listen(5000, () => {
	console.log("running on port 5000");
});

// post request to add authors
app.post("/author", (req, res) => {
	const { name } = req.body;
	const sql = "INSERT INTO authors (name) VALUES (?)";
	connection.query(sql, [name], (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send({ message: "author added successfully" });
	});
});

// post request to add books
app.post("/book", (req, res) => {
	const { id, title, author_id, published_date, category } = req.body;
	const sql =
		"INSERT INTO books (id,title,author_id,published_date,category) VALUES (?,?,?,?,?)";
	connection.query(
		sql,
		[id, title, author_id, published_date, category],
		(err, result) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: "something went wrong" });
			}
			res.send({ message: "book added successfully" });
		},
	);
});

// post request to add members
app.post("/member", (req, res) => {
	const { name, email } = req.body;
	const sql = "INSERT INTO members (name,email) VALUES (?,?)";
	connection.query(sql, [name, email], (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send({ message: "member added successfully" });
	});
});

// post request to add borrowings
app.post("/borrowing", (req, res) => {
	const { member_id, book_id, borrow_date, return_date } = req.body;
	const sql =
		"INSERT INTO borrowings (member_id,book_id,borrow_date,return_date) VALUES (?,?,?,?)";
	connection.query(
		sql,
		[member_id, book_id, borrow_date, return_date],
		(err, result) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: "something went wrong" });
			}
			res.send({ message: "borrowing added successfully" });
		},
	);
});

// get all authors
app.get("/authors", (req, res) => {
	const sql = "SELECT * FROM authors";
	connection.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send(result);
	});
});

// get all books
app.get("/books", (req, res) => {
	const sql = "SELECT * FROM books";
	connection.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send(result);
	});
});

// get all members
app.get("/members", (req, res) => {
	const sql = "SELECT * FROM members";
	connection.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send(result);
	});
});

// get all borrowings
app.get("/borrowings", (req, res) => {
	const sql = "SELECT * FROM borrowings";
	connection.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send(result);
	});
});

// Find All Books Borrowed by a Specific Member
app.get("/borrowings/:member_id", (req, res) => {
	const { member_id } = req.params;
	const sql = "SELECT * FROM borrowings WHERE member_id = ?";
	connection.query(sql, [member_id], (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send(result);
	});
});

// Find All Members Who Have Borrowed Books:
app.get("/borrowedBooks/members", (req, res) => {
	const sql = "SELECT DISTINCT member_id FROM borrowings";
	connection.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send(result);
	});
});

app.get("/most/borrowedBook", (req, res) => {
	const sql = "SELECT book_id FROM borrowings GROUP BY book_id limit 1";
	connection.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send(result);
	});
});

// Find All Books Not Borrowed in the Last Year:
app.get("/not/borrowed/books", (req, res) => {
	const sql =
		"SELECT * FROM books WHERE id NOT IN (SELECT book_id FROM borrowings WHERE borrow_date > DATE_SUB(CURDATE(), INTERVAL 1 YEAR))";
	connection.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send(result);
	});
});

// Find Members with No Borrowings:
app.get("/not/borrowed/members", (req, res) => {
	const sql =
		"SELECT * FROM members WHERE id NOT IN (SELECT member_id FROM borrowings)";
	connection.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "something went wrong" });
		}
		res.send(result);
	});
});

//  "nodemon --env-file=.env index.js"