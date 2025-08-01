import express from "express"
import cookieParser from "cookie-parser"
import Cors from "cors"
import dotenv from "dotenv"
dotenv.config({ path: ".env" })

const app = express()
app.use(
  Cors({
    origin: true,
    credentials: true,
  })
)

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ limit: "16kb", extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

import PlayerAuthRoute from "./routes/player.auth.route.js";
import OrganizerAuthRoute from "./routes/organizer.auth.route.js";
import AdminRoute from "./routes/admin.route.js";
import TournamentRoute from "./routes/Tournament.route.js";
import PaymentRoute from "./routes/payment.route.js";

app.use("/api/v1/player-auth", PlayerAuthRoute);
app.use("/api/v1/organizer-auth", OrganizerAuthRoute);
app.use("/api/v1/admin", AdminRoute);
app.use("/api/v1/tournaments", TournamentRoute);
app.use("/api/v1/payments", PaymentRoute);

export {app}