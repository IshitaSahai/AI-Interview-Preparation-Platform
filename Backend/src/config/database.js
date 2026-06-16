const mongoose=require("mongoose")



async function connectToDB(params) {

    try{
        await mongoose.connect(process.env.MONGO_URI)   

        console.log("Connected to Database")
    }
    catch(err){
    console.error("Database Connection Error:")
    console.error(err)
}
}

module.exports=connectToDB