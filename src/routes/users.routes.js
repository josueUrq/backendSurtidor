import { Router } from "express";
import validationRegister from "../middlewares/validateRegisterMiddleware.js";
import {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser,
  loginProcess,
} from "../controllers/user.controller.js";
const router = Router();
router.get("/users", getUsers);

router.get("/users/:id", getUser);

router.post("/users", validationRegister, createUser);

router.delete("/users/ci/:ci", deleteUser);

router.put("/users/:id", updateUser);

router.post("/", loginProcess);

export default router;
