var express = require('express');
var twilio = require('twilio');
var sqlite3 = require('sqlite3').verbose();
var router = express.Router();
var connectdb=require('../bin/db_connect');

let parser = require('../bin/parser');
let Postid = require("../bin/Posts");


router.get('/', function(req, res, next){

	let request_type;

   	let message_data = JSON.parse(req.query.message_data);
    let dbRequest;

	try {
		dbRequest = parser(message_data);
	}
	catch(error) {
		console.log(error);
	}


	if(message_data.Body.charAt(0) === "@"){
		// ** Request to get more detail on specific post
		request_type = "post_detail";
	}
    if(message_data.Body.substring(0,3).toLowerCase() == 'add') {
    	// ** Request to add new posts
    	request_type = "post_add";
    }
    if(typeof(dbRequest.query) != null && typeof(dbRequest.city) != null) {
    	// ** Request to get recent posts for perticular keyword
    	request_type = "post_query";
	}

    switch(request_type){
    	case "post_detail":
    		get_post_detail(req,res,next);
    		break;

    	case "post_add":
    		add_post(req, res, next);
    		break;

    	case "post_query":
    		query_post(req, res, next);
    		break;

    	default:
    		 handle_invalid_request(req, res, next);
    }

});

var get_post_detail = function(req, res, next){

   	let message_data = JSON.parse(req.query.message_data);
    let dbRequest;

	try {
		dbRequest = parser(message_data);
	}
	catch(error) {
		console.log(error);
	}

	let search = Postid.get(message_data.Body);
	var messages = connectdb.get_post_desc({"postid":search},function(data){
		data = data[0];

		let responseMsg = "@"+data.postid+"\n"+data.title.toUpperCase()+"\n\n"+data.description+"\n\n$"+ data.price+"\n"+data.city;

		res.send(responseMsg);
     });
}

var add_post = function(req, res, next){
   	let message_data = JSON.parse(req.query.message_data);
    let dbRequest;

	try {
		dbRequest = parser(message_data);
	}
	catch(error) {
		console.log(error);
	}

    let newPost = message_data.Body.replace("Add:", "");
    // let TestString = "Add: title:Buy House, description: Nice House, Name: Uzair, price: 900000, city: San Francisco";
    // let newPost = TestString.replace("Add:", "");
    let tokens = newPost.split(',');
    let Title =  tokens[0].split(':');
    let Description = tokens[1].split(':');
    let Phone = message_data.From;
    let Name = tokens[2].split(':');
    let Price = tokens[3].split(':');
    Price = parseInt(Price[1].trim());
    let City = tokens[4].split(':');
    dbNewPostObj = {
        title: Title[1].trim(),
        description: Description[1].trim(),
        phone: Phone.trim(),
        name: Name[1],
        price:  Price,
        city: City[1].trim()
    }

    var messages=connectdb.post_items(dbNewPostObj,function(data){
    		console.log(data[0].msg);
            res.send(data[0].msg);
    });
}

var query_post = function(req, res, next){
   	let message_data = JSON.parse(req.query.message_data);
    let dbRequest;

	try {
		dbRequest = parser(message_data);
	}
	catch(error) {
		console.log(error);
	}


	let messages=connectdb.search(dbRequest, function(data){
		console.log(data);
		let postList = "";
    	data.forEach(function(post, index){
    		let template = `#${post.postid} Title: ${post.title}, Price: $ ${post.price}`;
    		postList += template + '\n';
    	});
		res.send(postList);
	});
}

var handle_invalid_request = function(req, res, next){

    let helpString = "invalid entry. Plese type one of the following commands:\n";
    helpString += "-> Query: <query-string>, city:<city>\n";
    helpString += "-> @<post-id>\n";
    helpString += "> Add: title: <title>, description: <description>, name: <name>, price: <price>, city: <city>";
    res.send(helpString);
}

module.exports = router;
