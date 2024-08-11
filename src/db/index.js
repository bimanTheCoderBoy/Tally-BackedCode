
import mongoose from "mongoose";

const dbConnect = async ()=>{
    try{
        const connectionInstance =  await mongoose.connect(process.env.MONGO_URL);
        // console.log("host = ",connectionInstance.connection.host);
        // console.log("name = ",connectionInstance.connection.name)
        // console.log("port = ",connectionInstance.connection.port);
        // console.log("collections = ",connectionInstance.connection.collections);
        console.log("db connected successfylly");
    }
    catch(error){
        console.log("db connection failed\n",error);
        //  process.exit(1);
    }
}

export default dbConnect;