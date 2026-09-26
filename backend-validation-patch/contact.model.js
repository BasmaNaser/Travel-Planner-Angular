const mongoose = require('mongoose');
const FULL_NAME=/^[a-zA-Z]{3,15}( [a-zA-Z]{3,15}){1,3}$/;
const GMAIL=/^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const contactSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 fullName:{type:String,required:[true,'Full name is required'],trim:true,match:[FULL_NAME,'Please enter a valid Full Name']},
 email:{type:String,required:[true,'Email is required'],lowercase:true,trim:true,match:[GMAIL,'Please enter a valid Gmail address']},
 subject:{type:String,required:[true,'Subject is required'],trim:true,minlength:[3,'Subject must be at least 3 characters'],maxlength:[100,'Subject cannot exceed 100 characters']},
 message:{type:String,required:[true,'Message is required'],trim:true,minlength:[10,'Message must be at least 10 characters'],maxlength:[10000,'Message cannot exceed 10000 characters']},
 status:{type:String,enum:['pending','inProcess','resolved'],default:'pending'}
},{timestamps:true});
module.exports=mongoose.model('Contact',contactSchema);
