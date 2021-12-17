import mongoose from 'mongoose'

const watsappSchema = mongoose.Schema({
    message:String, 
    name:String, 
    timeStamp:String,
    received:Boolean,
});

export default mongoose.model('messagecontents', watsappSchema);