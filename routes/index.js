var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Sales = require('../models/sales');
var Stocks = require('../models/stock');
var json2csv = require('json2csv');
var { Parser } = require('json2csv');
const e = require('express');
const { Query } = require('mongoose');
const { json } = require('express');
var reportGlobal={};

router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});


router.post('/', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function(err){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {console.log('dsgu');
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	
	User.findOne({email:req.body.email},function(err,data){
		
		if(data){
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		// console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('home.ejs', {"name":data.username,"email":data.email});
		}
	});
});

router.get('/home', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		
		
		if(!data){
			res.redirect('/');
		}else{
			console.log("found");
			var currentDate= new Date();
			var twoDayAfter= new Date();
			twoDayAfter.setDate(twoDayAfter.getDate()+3)
			console.log("currentDate:"+currentDate+"twoDayAfter:"+twoDayAfter);
			var query = { expirydate: {$gte:currentDate,$lte:twoDayAfter} };
			var alertData={};
			Stocks.find(query,{},{sort:{expirydate:-1}},function(err,data){
				alertData.expiredData=data;
				console.log("expired"+alertData.expiredData);
				
				Stocks.find({},function(err,data){
					const stockDataQua = new Map();
					for (let item of data) {
						if(item.expirydate>new Date()) {
							if(stockDataQua.has(item.name)) {
								var updatedQuantity=stockDataQua.get(item.name) +item.quantity;
								stockDataQua.set(item.name,updatedQuantity);
							}
							else {
								stockDataQua.set(item.name,item.quantity);
							}
						}
					}
					var lowStockData=[];	
					for (const entry of stockDataQua) {
						console.log(entry[0]+':'+entry[1]);
						if(entry[1]<10) {
							lowStockData.push({name:entry[0],Quantity:entry[1]});	
						}
					  }
					alertData.lowStockData=lowStockData;
				return res.render('home.ejs', {"name":data.username,"email":data.email,"alertData":alertData});
				});
				
			});
		}
	});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		// console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not registered"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

router.get('/stock', function (req, res, next) {console.log('dsgu');
console.log("profile");
User.findOne({unique_id:req.session.userId},function(err,data){
console.log("data");
// console.log(data);
if(!data){
res.redirect('/');
}else{
//console.log("found");



Stocks.find({},{_id:0},function(err,data){
return res.render('stock.ejs',{"name":data.username,"email":data.email,stockdata:data});
});
}
});

});

router.post('/stock', function(req, res, next) {




	console.log(req.body);
	var stockInfo = req.body;
	
	
	if(!stockInfo.medicine_name || !stockInfo.category || !stockInfo.quantity || !stockInfo.size ||!stockInfo.expirydate){
	console.log('here it comes');
	res.send();
	} else {

				var c;
				Stocks.findOne({},{stockid:1},{sort:{stockid:-1}},function(err,data){

					if (data) {
						console.log("if");
						c = data.stockid + 1;
					
					}else{
						c=1;
						
					}

					var newStock = new Stocks({
						stockid:c,
						
						name: stockInfo.medicine_name,
						size: stockInfo.size,
						category: stockInfo.category,
						quantity:stockInfo.quantity,
						expirydate:stockInfo.expirydate,
						insertedDate: new Date()
						});
						
						newStock.save(function(err){
						if(err)
						console.log(err);
						else
						console.log('Success');
						});
						res.send({"Success":"Stock added."});
						}
						);
					}
				});

					



router.get('/salesNew', function (req, res, next) {console.log('dsgu');

User.findOne({unique_id:req.session.userId},function(err,data){
	console.log("data");
	// console.log(data);
	if(!data){
	res.redirect('/');
	}else{
		
	Sales.find({},function(err,data){
		
	return res.render('salesNew.ejs',{"name":data.username,"email":data.email,"salesData":data});
		});
		
	}
});
});

router.post('/deletestock', function (req, res, next) {
	console.log('deletestock whole body'+JSON.stringify(req.body) );
	console.log('deletestock'+req.body.stockid);
	var query = { stockid:req.body.stockid };
	Stocks.deleteOne(query,function(err,risk){
	});
});

router.post('/updatestock', function (req, res, next) {
	console.log('updatedstock whole body'+JSON.stringify(req.body) );
	console.log('deletestock'+req.body.stockid);
	const options = { upsert: true };
	var query = { stockid:req.body.stockid };
	Stocks.updateOne(query,req.body,options,function(err,risk){
	});	
});

router.post('/salesNew', function (req, res, next) {
	var g=0;
	var arr=[];
			var lst=[];

	var query = { expirydate: {$lte:new Date()} };
			async function my(){		
				await Stocks.find(query,{},{sort:{expirydate:-1}},function(err,risk){
					
						for (var i = 0;i<risk.length;i++){
							console.log("is tis come",risk.length);
				
							arr[i]=risk[i].stockid;
							console.log(arr[i]);
						}
						});
					}
		async function test(){				
			await my();
	Stocks.find({name:req.body.medicineName,size:req.body.size},{stockid:1,quantity:1},{sort:{stockid:1}},function(err,data){

		if(data==null || data.length==0){
			res.send({"Success":"stock Not Found!"});
			
		}
		
		else{
			
					
					
						for (const element of data) {
							console.log(arr[1]);
							console.log(element.stockid);
						if(arr.includes(element.stockid)){
							var b=2;
						
						}
					else{
						var c=3;
						console.log("hi");
						lst.push(element.stockid);

					}
					}
					if(c==3){
		console.log(c);
			var quantityInForm=parseInt(req.body.Quantity)
			for (const element of data) {
				console.log(element.stockid);


if(lst.includes(element.stockid)){
	console.log(c);
				if(quantityInForm<=element.quantity)	{
					console.log(c);
					 g=3;
					Stocks.updateOne({stockid:element.stockid},{$set:{quantity:element.quantity-quantityInForm}},function(err,result){
						if(err)
					console.log(err);
					else
					console.log(result);

					})
			var saledMedicine=[];
			var salesId=(new Date()).getTime().toString(36);
		
			saledMedicine.push({name:req.body.medicineName,size:req.body.size,quantity:req.body.Quantity});
			
		console.log("here");
			var newSale = new Sales({ salesId: salesId, 
				saledMedicines: saledMedicine,
				dateTime: new Date()
			 });
			 
			 
			newSale.save(function(err){
				if(err)
					console.log(err);
				else {
					console.log('Index Success');
					res.send({"Success":"Success!"});
				}
				console.log("then");
					
			});
			
			break; 
		} }}
		if(g!=3){
			b=8
		res.send({"Success":"sale Quantity is more than stock"});
		}
	
				
			
	
	}
	if(c!=3){
		res.send({"Success":"stock expired"});
	}
				
		}
      });
		}
		test();
});

router.get('/expiry', function (req, res, next) {console.log('dsgu');
User.findOne({unique_id:req.session.userId},function(err,data){
	console.log("data");
	// console.log(data);
	if(!data){
	res.redirect('/');
	}else{
		var query = { expirydate: {$lte:new Date()} };
	Stocks.find(query,{},{sort:{expirydate:-1}},function(err,data){
		
		console.log(data);
		var arr2 = [];
		for (var i = 0;i<data.length;i++){
			
			  arr2[i]=data[i].stockid;
			  console.log(arr2[i]);
			}
	return res.render('expiry.ejs',{"name":data.username,"email":data.email,"expiryData":data});
		});
		
	}
});
		
});




router.get('/report', function (req, res, next) {console.log('report');
User.findOne({unique_id:req.session.userId},function(err,data){
console.log("data");
// console.log(data);
if(!data){
res.redirect('/');
}else{
//console.log("found");
var emptyData={};
console.log("get report"+reportGlobal.fromDate);
if(reportGlobal.fromDate && reportGlobal.toDate) {
	var localFromDate=reportGlobal.fromDate;
	var localEndDate=reportGlobal.toDate;
	reportGlobal.fromDate=null;
	reportGlobal.toDate=null;
	
	console.log("get report inside if"+localFromDate+"reportType:"+reportGlobal.reportType);
	if(reportGlobal.reportType=="stock") {
		reportGlobal.reportType=null;
	var query = { insertedDate: {$gte:localFromDate,$lte:localEndDate} };
	Stocks.find(query,{},{sort:{expirydate:-1}},function(err,data){
    return res.render('report.ejs',{"name":data.username,"email":data.email,reportData:data});
}); 
	} else if(reportGlobal.reportType=="sales") {
		reportGlobal.reportType=null;
		var query = { dateTime: {$gte:localFromDate,$lte:localEndDate} };
		Sales.find(query,{},{sort:{dateTime:-1}},function(err,data){
			console.log(data);
			var saledMedicinelst=[]
			for (const element of data) {
				saledMedicinelst=saledMedicinelst.concat(element.saledMedicines);
			}
			console.log(saledMedicinelst);
	return res.render('report.ejs',{"name":data.username,"email":data.email,reportData:saledMedicinelst});
	}); 
	}
}
else {
	return res.render('report.ejs',{"name":data.username,"email":data.email});
}

}
});

});

router.post('/report', function(req, res, next) {
	console.log("inside report post:1");
	console.log(req.body);
	var reportRequest = req.body;
	console.log("post report"+reportGlobal.fromDate);
	reportGlobal.fromDate=reportRequest.fromDate;
	reportGlobal.toDate=reportRequest.endDate;
	reportGlobal.reportType=reportRequest.category;
	console.log("post report"+reportGlobal.fromDate);
	//res.send({"Success":"Stock added."});
/* 	Stocks.find({},function(err,data){
		console.log("inside report post:1");
		res.send(data);
		//return res.render('report.ejs',{"name":data.username,"email":data.email,stockdata:data});
		}); */
		//res.send(data);
	if(reportRequest){
		console.log('here it comes-report');
		


	
	res.send({"Success":"Stock added."});
	} else {

				var c;
				Stocks.findOne({},{stockid:1},{sort:{stockid:-1}},function(err,data){

					if (data) {
						console.log("if");
						c = data.stockid + 1;
					
					}else{
						c=1;
						
					}

					var newStock = new Stocks({
						stockid:c,
						
						name: stockInfo.medicine_name,
						size: stockInfo.size,
						category: stockInfo.category,
						quantity:stockInfo.quantity,
						expirydate:stockInfo.expirydate,
						insertedDate: new Date()
						});
						
						newStock.save(function(err){
						if(err)
						console.log(err);
						else
						console.log('Success');
						});
						res.send({"Success":"Stock added."});
						}
						);
					}
				});

	


module.exports = router;