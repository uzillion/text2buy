var sqlite3=require('sqlite3').verbose();

var tester={

	"test":function(callback){
		let db = new sqlite3.Database('./db/text2buy.db');
		var query=`SELECT * FROM posts`;
		db.all(query,function(err,row){
			//console.log(err,row);
			db.close();
			callback(row);
		});
	},
	"search": function(data, callback){
		let db = new sqlite3.Database('./db/text2buy.db');
		var city=data.city.toLowerCase();
		var title=data.query.toLowerCase();
		var query=`SELECT postid,title,price FROM posts where (title like "%${title}%" OR description like "%${title}%" ) AND (city like "${city}")`;
		console.log(query);
		db.all(query, function(err, row) {
		  	console.log(err);
		    callback(row);
		    db.close();
		});
	},
	"get_post_desc":function(data,callback){
		let db = new sqlite3.Database('./db/text2buy.db');
		id=parseInt(data.postid);
		console.log("This: "+id);
		var tables = ["postid","uaid","title","description","price","city"];
		var query=`SELECT ${tables.join(",")} FROM posts where postid=${id}`;
		db.all(query,function(err,row){
			console.log(err);
			callback(row);
		// console.log(JSON.stringify(this));
			db.close();
		});
	},
	"post_items":function(data,callback){
		let db = new sqlite3.Database('./db/text2buy.db');
		var description=data.description+"-->phone number:"+data.phone;
		var date1=new Date();
		var date=new Date();
		var newDate = new Date(date.setTime( date.getTime() + 7 * 86400000 ));
		var query_get_uid=`SELECT uaid from users WHERE phone="${data.phone}"`;
		db.all(query_get_uid,function(err,data1){
			if(data1.length){
				var query_post=`INSERT INTO posts(uaid,title,description,price,city,expireson,created,modified) values("${data1[0].uaid}","${data.title}","${description}","${data.price}","${data.city}","${newDate}","${date1}","${date1}")`;
				db.run(query_post,function(err){
		 			console.log(err);
		 			var json_data=[{"msg":"successfully added"}];
		 			callback(json_data);
		 			db.close();
		 		});
		 	}
		 	else{
		 		var query_create_user=`INSERT INTO users(name,phone) VALUES ("${data.name}","${data.phone}")`;
		 		db.run(query_create_user,function(err){
		 			console.log(err);
		 			db.all(query_get_uid,function(err,data1){
		 				console.log(err);
		 				var query_post=`INSERT INTO posts(uaid,title,description,price,city,expireson,created,modified) values("${data1[0].uaid}","${data.title}","${description}","${data.price}","${data.city}","${newDate}","${date1}","${date1}")`;
						db.run(query_post,function(err){
				 			console.log(err);
				 			var json_data=[{"msg":"successfully added"}];
				 			callback(json_data);
				 			db.close();
				 		});			
		 			});
		 		});
		 	}
	 	});
	}
};


module.exports=tester;
