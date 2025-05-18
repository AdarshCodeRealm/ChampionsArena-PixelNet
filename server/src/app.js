import express from "express"
import cookieParser from "cookie-parser"
import Cors from "cors"
import dotenv from "dotenv"
dotenv.config({ path: ".env" })

const app = express()
app.use(
  Cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  })
)

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ limit: "16kb", extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

import PlayerAuthRoute from "./routes/player.auth.route.js";

app.use("/api/v1/player-auth", PlayerAuthRoute);

export {app}