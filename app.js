const express = require('express');
const db = require('./connection');
const session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
const cors = require('cors');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cors());

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: process.env.EMAIL,
	  pass: process.env.PASSWORD
	}
  });

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/public/login.html');
});

app.post('/', function(request, response) {
    let mob = request.body.id;
	var username = request.body.username;
	var password = request.body.password;
    const sql = `select * from login where user_id=${mob} and username="${username}" and password="${password}"`;
	if (username && password) {
		db.query(sql, (error, results, fields) => {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				request.session.mob = mob;
				// console.log(request.session.mob);
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			// response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		// response.end();
	}
});

app.get('/signup', (req,res) => {
	res.render('signup');
});

app.post('/signup', (req,res) => {
	const id = req.body.id;
	const username = req.body.username;
	const password = req.body.password;
	const sql = `insert into login (user_id, username, password) values ('${id}','${username}','${password}')`;
	db.query(sql,(e, result) => {
		if(e) throw e
	});
	res.redirect("/");
})

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		// response.send('Welcome back, ' + request.session.username + '!');
        // response.sendFile(__dirname + '/public/wtlass1.html');
		response.render('trial');
	} else {
		// response.send('Please login to view this page!');
		response.redirect('/')
	}
	response.end();
});
let ret;
app.get('/booking', (req,res) => {
	if(req.session.loggedin){
		const sql = `select username,user_id from login where user_id  = '${req.session.mob}'`;
		db.query(sql, (e,result) => {
			if(e) throw e;
			ret = result;
			// console.log(result);
			// console.log(ret);			
		})
		setTimeout(() => {
			
			if(ret.length !== 0){
				res.render('booking', {results: ret});
			}				
			ret = [];
		}, 200);

		
	} else {
		// res.send('Please login to view this page!');
		res.redirect('/')
	}	
});

app.post('/booking', (req,res) => {
	const phno = req.body.phno
	const date = req.body.date;
	const seats = req.body.seats;
	console.log(seats.trim());
	const sql = `insert into booking(user_id, date, number_of_ppl) values (${phno},'${date}','${seats}')`;
	if(seats!=0 || date!=0){
	
	db.query(sql, (e,result) => {
		if(e) throw e;
	})
}
	// const mail = {
	// 	from: process.env.EMAIL,
	// 	to: req.body.email,
	// 	subject: 'Booking details from Cafe N Chill',
	// 	test:`Dear ${req.body.username} the booking details are 
	// 		  Registered Mob:${req.body.phno},
	// 		  Date:          ${req.body.date},
	// 		  No of seats:   ${req.body.seats}`
	// }
	// transporter.sendMail(mail,(e, info) => {
	// 	if(e) throw e;
	// })
res.redirect('/home');

})
let ret1 = [];
app.get('/seebook', (req,res) => {
	if(req.session.loggedin){
		const sql = `select table_id, user_id, date, number_of_ppl from booking where user_id = '${req.session.mob}' order by date`;
		db.query(sql, (e, result) => {
			if(e) throw e;
			for(let i of result){
				ret1.push(i);
			}
		});
		setTimeout(() => {
			if(ret1.length !== 0){
				res.render('seebook',{results: ret1});
			} else {
				res.send("<h1>No bookings have been made with this account</h1>");
			}
		}, 200)
	} else {
		res.redirect('/');
	}

});

app.get('/cart',(req,res) => {
	if(req.session.loggedin){
		res.render('cart');
	} else {
		res.redirect('/')
	}
	
});
app.get('/cancel',(req,res) => {
	if(req.session.loggedin){
		res.render('cancel');
	} else {
		res.redirect('/')
	}
	
});

app.post('/cancel', (req,res) => {
	const table_id = req.body.table_id;
	const sql = `delete from booking where user_id= '${req.session.mob}' and table_id = '${req.body.table_id}'`;
	db.query(sql, (e,result) => {
		if(e) throw e;
		res.redirect('/home');
	})
});



app.listen(3000, () => {
    console.log("server started at port 3000");
});