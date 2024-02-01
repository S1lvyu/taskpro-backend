const jwt = require("jsonwebtoken");
const {
  createUser,
  loginUser,
  findAccount,
  verifyEmail,
  resendVerifyEmail,
  createBoard,
  editBoard,
  createColumn,
  editColumn,
  deleteBoard,
  deleteColumn,
  createCard,
  editCard,
  deleteCard,
  moveCardToColumn,
  getBoards,
  getBackgroundImages,
} = require("../services/index");

require("dotenv").config();
const secret = process.env.SECRET;
const multer = require("multer");

const upload = require("../middlewares/upload");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const createAccount = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new Error("Missing required fields");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address");
    }
    const result = await createUser({
      email,
      password,
      name,
    });

    res.status(201).json({
      status: "succes",
      code: 201,
      data: {
        user: {
          email: result.email,
          name: result.name,
        },
      },
    });
  } catch (error) {
    if (
      error.message === "Missing email or password" ||
      "Invalid email address"
    ) {
      res.status(400).json({
        status: 400,
        error: error.message,
      });
    } else {
      res.status(409).json({
        status: 409,
        error: "email in use",
      });
    }
  }
};

const loginAccount = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Missing email or password");
    }

    const payload = { email: email };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    const result = await loginUser({
      email,
      password,
      token,
    });

    const tokenExpiryTime = Date.now() + 60 * 60 * 1000;
    result.setToken(token);

    res.status(200).json({
      status: "succes",
      code: 200,
      data: {
        token: token,
        tokenValability: tokenExpiryTime,
        user: {
          email: result.email,
          name: result.name,
          avatar: result.avatar,
        },
      },
    });
  } catch (error) {
    if (error.message === "Wrong email or password") {
      res.status(401).json({
        status: 401,
        message: error.message,
      });
      return;
    }
    res.status(400).json({
      status: 400,
      error: error.message,
    });
  }
};

const logoutAccount = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ status: 401, message: "Not authorized" });
    }
    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, secret);

    const user = await findAccount(decodedToken);
    user.setToken(null);
    await user.save();
    if (user) {
      res.status(204).json({
        status: "success",
        code: 204,
      });
    } else {
      res.status(404).json({ status: "404", message: "User not found" });
    }
  } catch (error) {
    if (error.message === "invalid token") {
      res.status(401).json({ status: 401, message: error.message });
    }

    res.status(500).json({ status: "error", message: "Server error" });
  }
};

const getAccount = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ status: 401, message: "Not authorized" });
    }
    const token = authHeader.split(" ")[1];

    const user = jwt.verify(token, secret);

    const result = await findAccount({ email: user.email });

    if (result) {
      res.status(200).json({
        status: "success",
        code: 200,
        data: {
          email: result.email,
          name: result.name,
        },
      });
    } else {
      res.status(404).json({ status: "404", message: "User not found" });
    }
  } catch (error) {
    if (error.message === "invalid token") {
      res.status(401).json({ status: 401, message: "Not authorized" });
    }

    res.status(500).json({ status: "error", message: "Server error" });
  }
};

const verifyEmailController = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    await verifyEmail(verificationToken);

    res.status(200).json({ message: "Verification successful", code: 200 });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;
  try {
    await resendVerifyEmail(email);
    res.status(200).json({
      status: 200,
      message: "Verification email sent",
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ status: 401, message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, secret);

    const user = await findAccount(decodedToken);

    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.setPassword(password);

    // Utilizează `upload.single('avatar')` pentru a gestiona încărcarea unui singur fișier cu cheia 'avatar'
    upload.single("avatar")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "File upload error",
          error: err.message,
        });
      } else if (err) {
        return res.status(500).json({
          status: "error",
          code: 500,
          message: "Internal server error",
          error: err.message,
        });
      }

      // Restul codului pentru manipularea fișierului încărcat și încărcarea în Cloudinary
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "avatars",
        });
        user.avatar = result.secure_url;
      }

      await user.save();

      res.status(200).json({
        status: "success",
        code: 200,
        data: {
          user: {
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: error.message,
    });
  }
};

const addBoard = async (req, res, next) => {
  try {
    const user = req.user;
    const { boardName, icon, background } = req.body;
    const result = await createBoard({ user, boardName, icon, background });
    res.status(201).json({
      status: "succes",
      code: 201,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};

const updateBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    console.log(boardId);
    const { boardName, icon, background } = req.body;
    const result = await editBoard({ boardId, boardName, icon, background });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};

const removeBoard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteBoard({ id });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};

const addColumn = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    console.log(req.body);
    const { columnName } = req.body;
    console.log(columnName);
    const response = await createColumn({ boardId, columnName: columnName });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: response,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};

const updateColumn = async (req, res, next) => {
  try {
    const { columnId } = req.params;

    const { columnName } = req.body;
    const result = await editColumn({ id: columnId, columnName: columnName });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};
const removeColumn = async (req, res, next) => {
  try {
    const { columnId } = req.params;
    console.log("columnId:", columnId);
    const result = await deleteColumn({ id: columnId });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};
const addCard = async (req, res, next) => {
  try {
    const { columnId } = req.params;
    const { title, description, labelColor, deadline } = req.body;
    console.log(req.body);
    const result = await createCard({
      columnId,
      title,
      description,
      labelColor,
      deadline,
    });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};
const updateCard = async (req, res, next) => {
  try {
    console.log("test");
    const { cardId } = req.params;
    console.log(cardId);
    const { title, description, labelColor, deadline } = req.body;
    const result = await editCard({
      id: cardId,
      title,
      description,
      labelColor,
      deadline,
    });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};
const removeCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const result = await deleteCard({ id: cardId });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};
const loadBoards = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await getBoards({ user });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};
const loadBackgroundImages = async (req, res, next) => {
  try {
    const result = await getBackgroundImages();
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      error: error.message,
    });
  }
};

const moveCard = async (req, res, next) => {
  try {
    const { cardId, columnId } = req.params;
    console.log(cardId);
    console.log(columnId);
    const response = await moveCardToColumn({
      cardId: cardId,
      newColumnId: columnId,
    });
    res.status(200).json({
      status: "succes",
      code: 200,
      data: response,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      data: error.message,
    });
  }
};
module.exports = {
  createAccount,
  loginAccount,
  logoutAccount,
  verifyEmailController,
  getAccount,
  updateUser,
  resendVerificationEmail,
  addBoard,
  updateBoard,
  removeBoard,
  addColumn,
  updateColumn,
  removeColumn,
  addCard,
  updateCard,
  removeCard,
  loadBoards,
  loadBackgroundImages,
  moveCard,
};
