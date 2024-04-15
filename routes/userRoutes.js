const express = require("express");
const {
  registerUser,
  authUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

router.route("/register").post(registerUser);
router.route("/login").post(authUser);
router.route("/view").get(protect, getUser);
router.route("/edit").post(protect, updateUser);
router.route("/delete").delete(protect, deleteUser);

module.exports = router;
