require("dotenv").config()
const app=require("./src/app")
const connectToDB=require("./src/config/database")
const invokeGeminiAI=require("./src/services/ai.service")

connectToDB()

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});