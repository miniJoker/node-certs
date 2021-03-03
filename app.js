const http = require('http');
const fs = require("fs");

const hostname = '127.0.0.1';
const port = 3000;
let data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
let user = undefined;

// data = [{
// 	user : {
// 		createdCerts: [
// 			{
// 				id, item, count, creator, recipient
// 			}
// 		],
// 		recivedCerts: []
// 	}
// }]

if (!data) data = { init: "true"};
console.log("data:", data);
const server = http.createServer((req, res) => {
	let url = req.url;
	console.log(url);
	if (url == "/") {
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
  	fs.createReadStream('./mvp.html').pipe(res);
	} else if (url == "/set_user") {
		let reqData = '';
		req.on('data', chunk => {
			reqData += chunk;
		});
		req.on('end', () => {
			let sendUser = reqData;
			if (data[sendUser] == undefined) {
				data[sendUser] = {};
				console.log("before  write file");
				console.log(data);
				fs.writeFileSync('./data.json', JSON.stringify(data, null, 2)); 
			}
			user = sendUser;
			res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
			res.end(user);
		});
	} else if (user != undefined) {
		if (url == "/get_created") {
			res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
			if (data[user].createdCerts == undefined) {
				data[user].createdCerts = [];
			}
			res.end(JSON.stringify(data[user].createdCerts));
		} else if (url == "/get_recived") {
			res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
			if (data[user].recivedCerts == undefined) {
				data[user].recivedCerts = [];
			}
			res.end(JSON.stringify(data[user].recivedCerts));
		} else if (url == "/create_cert") {
			let reqData = '';
			req.on('data', chunk => {
				reqData += chunk;
			});
			req.on('end', () => {
				let certObj = JSON.parse(reqData);
				console.log("certObj: ", certObj);
				if (data[user].createdCerts == undefined) {
					data[user].createdCerts = [];
				}
				certObj.id = user + data[user].createdCerts.length;
				certObj.creator = user;
				let recUser = certObj.recipient;
				if (data[recUser] == undefined) {
					data[recUser] = {};
				}
				if (data[recUser].recivedCerts == undefined) {
					data[recUser].recivedCerts = [];
				}
				data[user].createdCerts.push(certObj);
				data[recUser].recivedCerts.push(certObj);

				fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
				res.end(JSON.stringify(data[user].createdCerts.length));
			});
		} else {
			res.end();
		}
	} else {
		res.end();
	}


  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});