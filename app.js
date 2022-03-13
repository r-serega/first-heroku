const express = require("express");
const admin = require('firebase-admin');
//const firebase = require('firebase/auth');
//const firebase = require('firebase');
const fetch = require('node-fetch');
const serviceAccount = require('./storegoods-9bf75-firebase-adminsdk-nglvo-b7779dc47f.json');

const PORT = process.env.PORT || 5000

const app = express();

const firebaseApp = admin.initializeApp({
  	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://storegoods-9bf75-default-rtdb.firebaseio.com/',
})

const db = admin.firestore();

//const authApp = firebase.initializeApp({
//  	credential: admin.credential.cert(serviceAccount),
//	databaseURL: '',//'https://<DATABASE_NAME>.firebaseio.com'
//})

//const _auth = firebase.auth();

const defaultAuth = firebaseApp.auth();
/*
var firebaseConfig = {
  apiKey: "AIzaSyByvi0G1ZuQvhjS2cHo5oqElyM1gWrxDJM",
  authDomain: "storegoods-9bf75.firebaseapp.com",
  databaseURL: "https://storegoods-9bf75-default-rtdb.firebaseio.com/",
  projectId: "storegoods-9bf75",
  storageBucket: "storegoods-9bf75.appspot.com",
  messagingSenderId: "495679170028",
  appId: "1:495679170028:web:ec9b3f10614ec404058cc9"
}
firebase.initializeApp(firebaseConfig);
let database = firebase.database();
*/
let database = admin.database();

app.use(function(request, response, next){     
    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let data = `${hour}:${minutes}:${seconds} ${request.method} ${request.url} ${request.get("user-agent")}`;
    console.log(data);
    next();
});

app.get("/", function(request, response){
    response.send("<h2>Привет Express!</h2>");
});

app.get("/about", function(request, response){
	console.log(firebaseApp.name);
	console.log(defaultAuth.name);
	console.log(serviceAccount);
    response.send("<h1>О сайте</h1>");
});

app.get("/contact", function(request, response){
    response.send("<h1>Контакты</h1>");
});

app.get("/realtime", function(request, response){

var obj = JSON.stringify({
                item: "first item",
                id: 30
        });

database.ref("customPath").set(obj, function(error) {
    if (error) {
      // The write failed...
      console.log("Failed with error: " + error)
    } else {
      // The write was successful...
      console.log("success")
    }
})
    response.send("<h1>Real Time</h1>");
});

app.get("/read", function(request, response){

database.ref('customPath').once('value').then(function(snapshot) {
    console.log( snapshot.val() )
})

    response.send("<h1>Read</h1>");
});

async function postDB() {
    const response = await fetch("http://localhost:3000/storegoods-9bf75/us-central1/app/api/create", { 
//    const response = await fetch("https://us-central1-storegoods-9bf75.cloudfunctions.net/app/api/create", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: "first item",
                id: 30
        })
    });
    const responseText = await response.text();
    console.log(responseText);
    //return responseText;
}

  async function create(collection, document) {
    const result = await db.collection(collection).add(document);
    document.id = result.id;
    return document;
  }

app.get("/db", async function(req, res){
    const id = req.query.id;
    const item2 = req.query.item;
//  var req2 = postDB();
  console.log(req.query.id);
  console.log(req.query.item);

var obj = JSON.stringify({
                item: "first item",
                id: 30
        });
const user = { id: id, name: req.query.item };
  // create
	let doc = await create("users",user);
	console.log(doc);
//  app.post('/api/create', (req, res) => {
//    	(async () => {
//        	try {
//          		await db.collection('items').doc('/' + id + '/')
//             			.create({item: item2});
//          		return res.status(200).send();
//        	} catch (error) {
//          		console.log(error);
//          		return res.status(500).send(error);
//        	}
//      	})();
//  });
	
    res.send("<h1>База данных</h1>");
});

  async function read(collection, id) {
    const result = await db.collection(collection).doc(id).get();
    if (!result.exists) return null; // Record not found

    const doc = result.data();
    doc.id = result.id;
    return doc;
  }

app.get("/db_read", async function(request, response){

let doc = await read("users", 'YGJIr9NLZSrZqHneZGXz');
	console.log(doc);

    response.send("<h1>Read Firestore</h1>");
});

app.get("/new", function(request, response){
    let userName = request.query.name;
    let password = request.query.password;
    response.send("<h1>Информация Новый пользователь</h1><p>name=" + userName + "</p><p>password=" + password +"</p>");
	console.log(userName);
	console.log(password);

//	firebaseApp.auth()
	firebaseApp.Auth.createUserWithEmailAndPassword(userName, password).then((userCredential) => {
	// Signed in 
    	 var user = userCredential.user;
	 console.log(user);
    	// ...
 	})
  	.catch((error) => {
    		var errorCode = error.code;
    		var errorMessage = error.message;
		console.log(errorCode);
		console.log(errorMessage);
	});
});

//app.listen(3000, ()=>console.log("Сервер запущен по адресу http://localhost:3000"));
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
