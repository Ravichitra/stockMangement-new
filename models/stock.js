var mongoose = require('mongoose');
var Schema = mongoose.Schema;


stockSchema = new Schema( {
	
	stockid: Number,
	name: String,
	size:String,
	category: String,
	quantity:Number,
	expirydate:Date
}),
Stocks = mongoose.model('stock', stockSchema);

module.exports = Stocks;