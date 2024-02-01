const express = require("express");
const router = express.Router();
const controller = require("../../controllers/controllers");
const { auth } = require("../../middlewares/auth");

/**
 * @swagger
 * /taskPro/signup/:
 *   post:
 *     summary: Register an account
 *     description: Register a user account based on the provided information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               name:
 *                 type: string
 *                 description: User's name
 *     responses:
 *       201:
 *         description: Success - User created
 *       400:
 *         description: Error due to missing required fields or invalid types
 *       409:
 *         description: Error - Email is already registered
 */
router.post("/signup", controller.createAccount);
/**
 * @swagger
 * /taskPro/login/:
 *   post:
 *     summary: Authenticate an account
 *     description: Authenticate a user account based on the provided information and create a daily log for the current day if it doesn't exist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Success - User authenticated
 *       401:
 *         description: Error - Incorrect email or password
 *       400:
 *         description: Error
 */
router.post("/login", controller.loginAccount);
/**
 * @swagger
 * /taskPro/logout/:
 *   get:
 *     summary: Log out a user
 *     description: Log out a user based on the Bearer token in the Authorization header
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Success - User logged out
 *       401:
 *         description: Error - Token is missing or invalid
 *       404:
 *         description: Error - User does not exist in the database
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get("/logout", controller.logoutAccount);
/**
 * @swagger
 * /taskPro/background:
 *   get:
 *     summary: Load background images.
 *     description: Endpoint to retrieve the list of available background images.
 *     responses:
 *       200:
 *         description: Success. Returns the list of background images.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data: [ { imageURL: 'https://example.com/image1.jpg' }, { imageURL: 'https://example.com/image2.jpg' } ]
 *       404:
 *         description: Error. Could not load background images.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: Specific error message.
 */
router.get("/background", controller.loadBackgroundImages);
/**
 * @swagger
 * /taskPro/current-user:
 *   get:
 *     summary: Get current user information.
 *     description: Retrieves information about the currently authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Returns the user's information.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data: { email: 'user@example.com', name: 'John Doe' }
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               message: User not found
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Server error
 */
router.get("/current-user", auth, controller.getAccount);
/**
 * @swagger
 * /current-user/update:
 *   patch:
 *     summary: Update current user information.
 *     description: Updates information for the currently authenticated user, including file upload for avatar.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: User details to be updated, including optional avatar file.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Success. Returns updated user information.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data: { user: { email: 'updated@example.com', name: 'Updated User', avatar: 'updated_avatar_url' } }
 *       400:
 *         description: Bad Request. File upload error.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 400
 *               message: File upload error
 *               error: Multer error details
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 500
 *               message: Internal server error
 *               error: Server error details
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               message: User not found
 */
router.patch("/current-user/update", auth, controller.updateUser);
/**
 * @swagger
 * /taskPro/homepage:
 *   get:
 *     summary: Get user boards.
 *     description: Retrieves boards associated with the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Returns user boards.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 - boardId: "board_id_1"
 *                   boardName: "Board 1"
 *                   icon: "board_icon_url_1"
 *                   background: "board_background_url_1"
 *                   columns:
 *                     - columnId: "column_id_1"
 *                       columnName: "Column 1"
 *                       cards:
 *                         - cardId: "card_id_1"
 *                           title: "Card 1"
 *                           description: "Card description 1"
 *                           labelColor: "#8FA1D0"
 *                           deadline: "2022-12-31"
 *                         - cardId: "card_id_2"
 *                           title: "Card 2"
 *                           description: "Card description 2"
 *                           labelColor: "#E09CB5"
 *                           deadline: "2022-12-31"
 *                     - columnId: "column_id_2"
 *                       columnName: "Column 2"
 *                       cards:
 *                         - cardId: "card_id_3"
 *                           title: "Card 3"
 *                           description: "Card description 3"
 *                           labelColor: "#BEDBB0"
 *                           deadline: "2022-12-31"
 *       404:
 *         description: Error. User boards not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Boards not found"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.get("/homepage", auth, controller.loadBoards);
/**
 * @swagger
 * /taskPro/homepage/addBoard:
 *   post:
 *     summary: Add a new board.
 *     description: Creates a new board for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               boardName:
 *                 type: string
 *                 description: The name of the new board.
 *               icon:
 *                 type: string
 *                 description: URL or identifier for the board icon.
 *               background:
 *                 type: string
 *                 description: URL or identifier for the board background.
 *             required:
 *               - boardName
 *               - icon
 *               - background
 *     responses:
 *       201:
 *         description: Success. Returns the created board.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 201
 *               data:
 *                 boardId: "board_id_1"
 *                 boardName: "New Board"
 *                 icon: "board_icon_url_1"
 *                 background: "board_background_url_1"
 *       404:
 *         description: Error. Board creation failed.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Board creation failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */

router.post("/homepage/addBoard", auth, controller.addBoard);
/**
 * @swagger
 * /taskPro/homepage/update/{boardId}:
 *   patch:
 *     summary: Update board details.
 *     description: Updates the details of a specific board for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         description: The ID of the board to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               boardName:
 *                 type: string
 *                 description: The new name for the board.
 *               icon:
 *                 type: string
 *                 description: URL or identifier for the new board icon.
 *               background:
 *                 type: string
 *                 description: URL or identifier for the new board background.
 *             required:
 *               - boardName
 *               - icon
 *               - background
 *     responses:
 *       200:
 *         description: Success. Returns the updated board.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 boardId: "board_id_1"
 *                 boardName: "Updated Board"
 *                 icon: "updated_board_icon_url_1"
 *                 background: "updated_board_background_url_1"
 *       404:
 *         description: Error. Board update failed or board not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Board update failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.patch("/homepage/update/:boardId", auth, controller.updateBoard);
/**
 * @swagger
 * /taskPro/homepage/delete/{boardId}:
 *   delete:
 *     summary: Delete a board.
 *     description: Deletes a specific board for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         description: The ID of the board to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Returns details of the deleted board.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 boardId: "board_id_1"
 *                 boardName: "Deleted Board"
 *                 icon: "deleted_board_icon_url_1"
 *                 background: "deleted_board_background_url_1"
 *       404:
 *         description: Error. Board deletion failed or board not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Board deletion failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.delete("/homepage/delete/:boardId", auth, controller.removeBoard);
/**
 * @swagger
 * /taskPro/homepage/boards/{boardId}:
 *   post:
 *     summary: Add a column to a board.
 *     description: Adds a new column to the specified board for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         description: The ID of the board to which the column will be added.
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: The column data to be added.
 *         schema:
 *           type: object
 *           properties:
 *             columnName:
 *               type: string
 *     responses:
 *       200:
 *         description: Success. Returns details of the added column.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 columnId: "column_id_1"
 *                 columnName: "New Column"
 *       404:
 *         description: Error. Column addition failed or board not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Column addition failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.post("/homepage/boards/:boardId", auth, controller.addColumn);
/**
 * @swagger
 * /taskPro/homepage/boards/updateColumn/{columnId}:
 *   patch:
 *     summary: Update a column in a board.
 *     description: Updates the details of a column in the specified board for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         description: The ID of the column to be updated.
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: The updated column data.
 *         schema:
 *           type: object
 *           properties:
 *             columnName:
 *               type: string
 *     responses:
 *       200:
 *         description: Success. Returns details of the updated column.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 columnId: "column_id_1"
 *                 columnName: "Updated Column"
 *       404:
 *         description: Error. Column update failed or column not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Column update failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.patch(
  "/homepage/boards/updateColumn/:columnId",
  auth,
  controller.updateColumn
);
/**
 * @swagger
 * /taskPro/homepage/boards/deleteColumn/{columnId}:
 *   delete:
 *     summary: Delete a column from a board.
 *     description: Deletes the specified column from the board for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         description: The ID of the column to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Returns details of the deleted column.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 columnId: "column_id_1"
 *                 columnName: "Deleted Column"
 *       404:
 *         description: Error. Column deletion failed or column not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Column deletion failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.delete(
  "/homepage/boards/deleteColumn/:columnId",
  auth,
  controller.removeColumn
);
/**
 * @swagger
 * /taskPro/homepage/boards/addCard/{columnId}:
 *   post:
 *     summary: Add a card to a column.
 *     description: Adds a new card to the specified column for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         description: The ID of the column where the card will be added.
 *         schema:
 *           type: string
 *       - in: body
 *         name: card
 *         description: Card details to be added.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               description: The title of the card.
 *             description:
 *               type: string
 *               description: The description of the card.
 *             labelColor:
 *               type: string
 *               description: The color label of the card.
 *             deadline:
 *               type: string
 *               format: date
 *               description: The deadline for the card (optional).
 *     responses:
 *       200:
 *         description: Success. Returns details of the added card.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 cardId: "card_id_1"
 *                 title: "New Card"
 *                 description: "Description of the new card."
 *                 labelColor: "#FF5733"
 *                 deadline: "2024-12-31"
 *       404:
 *         description: Error. Card addition failed or column not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Card addition failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.post("/homepage/boards/addCard/:columnId", auth, controller.addCard);
/**
 * @swagger
 * /taskPro/homepage/boards/updateCard/{cardId}:
 *   patch:
 *     summary: Update a card in a column.
 *     description: Updates the details of the specified card in the authenticated user's board.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         description: The ID of the card to be updated.
 *         schema:
 *           type: string
 *       - in: body
 *         name: card
 *         description: Updated card details.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               description: The updated title of the card.
 *             description:
 *               type: string
 *               description: The updated description of the card.
 *             labelColor:
 *               type: string
 *               description: The updated color label of the card.
 *             deadline:
 *               type: string
 *               format: date
 *               description: The updated deadline for the card (optional).
 *     responses:
 *       200:
 *         description: Success. Returns details of the updated card.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 cardId: "card_id_1"
 *                 title: "Updated Card"
 *                 description: "Updated description of the card."
 *                 labelColor: "#00FF00"
 *                 deadline: "2025-01-31"
 *       404:
 *         description: Error. Card update failed or card not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Card update failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.patch(
  "/homepage/boards/updateCard/:cardId",
  auth,
  controller.updateCard
);
/**
 * @swagger
 * /taskPro/homepage/boards/removeCard/{cardId}:
 *   delete:
 *     summary: Remove a card from a column.
 *     description: Removes the specified card from the authenticated user's board.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         description: The ID of the card to be removed.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Returns details of the removed card.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 cardId: "card_id_1"
 *                 title: "Removed Card"
 *                 description: "Description of the removed card."
 *                 labelColor: "#FF0000"
 *                 deadline: "2025-01-31"
 *       404:
 *         description: Error. Card removal failed or card not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Card removal failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.delete(
  "/homepage/boards/removeCard/:cardId",
  auth,
  controller.removeCard
);
/**
 * @swagger
 * /taskPro/homepage/boards/moveCard/{cardId}/{columnId}:
 *   patch:
 *     summary: Move a card to a different column.
 *     description: Moves the specified card to a different column on the authenticated user's board.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         description: The ID of the card to be moved.
 *         schema:
 *           type: string
 *       - in: path
 *         name: columnId
 *         required: true
 *         description: The ID of the target column to move the card to.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. Returns details of the moved card.
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               code: 200
 *               data:
 *                 cardId: "card_id_1"
 *                 title: "Moved Card"
 *                 description: "Description of the moved card."
 *                 labelColor: "#00FF00"
 *                 deadline: "2025-01-31"
 *       404:
 *         description: Error. Card movement failed or card not found.
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               code: 404
 *               error: "Card movement failed"
 *       401:
 *         description: Unauthorized. User not authenticated or token is invalid.
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: Not authorized
 */
router.patch(
  "/homepage/boards/moveCard/:cardId/:columnId",
  auth,
  controller.moveCard
);
/**
 * @swagger
 * /taskPro/verify/{verificationToken}:
 *   get:
 *     summary: Verify user email using a verification token.
 *     description: Verifies the user's email using the provided verification token.
 *     parameters:
 *       - in: path
 *         name: verificationToken
 *         required: true
 *         description: The verification token received via email.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. User email successfully verified.
 *         content:
 *           application/json:
 *             example:
 *               message: "Verification successful"
 *               code: 200
 *       404:
 *         description: Error. Email verification failed or invalid verification token.
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "Email verification failed"
 */
router.get("/verify/:verificationToken", controller.verifyEmailController);
/**
 * @swagger
 * /taskPro/user/verify:
 *   post:
 *     summary: Resend verification email.
 *     description: Resends the verification email to the user's registered email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Success. Verification email sent successfully.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               message: "Verification email sent"
 *       400:
 *         description: Bad Request. Invalid email or other error during the process.
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               message: "Invalid email or error during the process"
 */
router.post("/user/verify", controller.resendVerificationEmail);

module.exports = router;
