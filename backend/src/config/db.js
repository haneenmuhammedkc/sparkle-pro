import mongoose from 'mongoose'

const connectDB = async () => {
  try{
    const conn = await mongoose.connect(process.env.MONGO_URL)
    console.log("MongoDB is Connected successfully")
  }
  catch(error){
    console.error(`[Database Error] Connection failed: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB