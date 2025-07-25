// npm run dev  --->> to start nodemon server
import connectDB from "./db/index.js"
import { app } from "./app.js"
import dotenv from "dotenv"
import { scheduleTournamentStatusUpdates } from "./utils/schedulers/tournamentStatusScheduler.js"
dotenv.config({ path: ".env" })
const port = process.env.PORT || 8000

connectDB()
  .then(() => {
    app.get("/", (req, res) => {
      res.status(200).json({
        status: "success",
        message: "Server is running fine",
      })
    })
    
    app.listen(port, () => {
      console.log(`⚙️  Local Server is running at port : ${port}`)
      
      // Initialize tournament status update scheduler
      scheduleTournamentStatusUpdates()
    })
  })
  .catch((error) => {
    console.log("MONGO db connection failed !!! ", error)
  })
