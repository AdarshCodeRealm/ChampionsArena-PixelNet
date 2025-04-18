import {getAllTournaments,getTournamentById} from "../controllers/Tournament.controller.js";
import {Router} from "express";

const router = Router();

router.get("/",getAllTournaments);

export default router;
