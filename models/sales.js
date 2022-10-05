var mongoose = require('mongoose');
var Schema = mongoose.Schema;

salesSchema = new Schema( {
	
	salesId: String,
	dateTime: Date,
	saledMedicines: [
		{
			name:String,
			size:String,
			quantity:Number
		}
	]
}),
Sales = mongoose.model('sales', salesSchema);

module.exports = Sales;