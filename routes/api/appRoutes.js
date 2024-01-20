const express = require("express");
const router = express.Router();
const controller = require("../../controllers/controllers");
const { auth } = require("../../middlewares/auth");

router.post("/signup", controller.createAccount);

router.post("/login", controller.loginAccount);

router.get("/logout", controller.logoutAccount);

router.get("/background", controller.loadBackgroundImages);

router.get("/current-user", auth, controller.getAccount);

router.patch("/current-user/update", auth, controller.updateUser);

router.get("/homepage", auth, controller.loadBoards);

router.post("/homepage/addBoard", auth, controller.addBoard);

router.patch("/homepage/update/:boardId", auth, controller.updateBoard);

router.delete("/homepage/delete/:boardId", auth, controller.removeBoard);

router.post("/homepage/boards/:boardId", auth, controller.addColumn);

router.patch(
  "/homepage/boards/updateColumn/:columnId",
  auth,
  controller.updateColumn
);

router.delete(
  "/homepage/boards/deleteColumn/:columnId",
  auth,
  controller.removeColumn
);

router.post("/homepage/boards/addCard/:columnId", auth, controller.addCard);

router.patch(
  "/homepage/boards/updateCard/:cardId",
  auth,
  controller.updateCard
);

router.delete(
  "/homepage/boards/removeCard/:cardId",
  auth,
  controller.removeCard
);

router.patch(
  "/homepage/boards/moveCard/:cardId/:columnId",
  auth,
  controller.moveCard
);

router.get("/verify/:verificationToken", controller.verifyEmailController);

router.post("/user/verify", controller.resendVerificationEmail);

module.exports = router;
