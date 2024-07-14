import mongoose from 'mongoose'

const connectToDb = async () =>{
    try{
       const con = await mongoose.connect("mongodb+srv://niketan:Niketanisbest%40100@cluster0.vbwyhut.mongodb.net/");
       console.log("MongoDB connected : ", con.connection.host);

    }catch(e){
        console.log(e);
        process.exit(1);
    }
}
export default connectToDb;