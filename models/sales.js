var mongoose = require('mongoose');
var Schema = mongoose.Schema;

salesSchema = new Schema( {
	
	salesId: String,
	dateTime: String,
	saledMedicines: [
		{
			name:String,
			size:String,
			Quantity:Number
		}
	]
}),
Sales = mongoose.model('sales', salesSchema);

module.exports = Sales;