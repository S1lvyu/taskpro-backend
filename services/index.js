const User = require("./schemas/usersSchema");
const Board = require("./schemas/boardsSchema");
const Column = require("./schemas/columnsSchema");
const BackgroundImages = require("./schemas/backgroundImages");
const Card = require("./schemas/cardSchema");
const nanoid = require("nanoid");
const nodeMailer = require("nodemailer");

require("dotenv").config();

const createUser = async ({ email, password, name }) => {
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const verificationToken = nanoid();

    const transporter = nodeMailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.OUTLOOK_EMAIL,
        pass: process.env.OUTLOOK_PASS,
      },
    });

    const mailOptions = {
      from: process.env.OUTLOOK_EMAIL,
      to: email,
      subject: "Email Verification",
      html: `<p>For account verification click on the following link<b><a  href="http://localhost:3000/taskPro/verify/${verificationToken}">
              Click Here!
            </a>
          </b>
        </p>`,
    };
    transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    const newUser = new User({
      email,
      password,
      name,
      verificationToken: verificationToken,
    });
    newUser.setPassword(password);

    return await newUser.save();
  } catch (error) {
    throw error;
  }
};

const loginUser = async ({ email, password, token }) => {
  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    throw new Error("Wrong email or password");
  }
  if (!user.verify) {
    throw new Error("Before login you have to verify your email address");
  }
  user.setToken(token);
  await user.save();
  return user;
};

const findAccount = async (user) => {
  const result = await User.findOne({ email: user.email });
  return result;
};

const verifyEmail = async (verificationToken) => {
  const update = { verify: true, verificationToken: null };

  const result = await User.findOneAndUpdate(
    {
      verificationToken,
    },
    { $set: update },
    { new: true }
  );

  if (!result) throw new Error("User not found");
};

const resendVerifyEmail = async (email) => {
  const result = await User.findOne({ email });
  if (!result) throw new Error("User not found");
  const verificationToken = result.verificationToken;

  if (!verificationToken)
    throw new Error("Verification has already been passed");
  const transporter = nodeMailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.OUTLOOK_EMAIL,
      pass: process.env.OUTLOOK_PASS,
    },
  });

  const mailOptions = {
    from: process.env.OUTLOOK_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<p>For account verification click on the following link<b><a  href="http://localhost:3000/api/verify/${verificationToken}">
              Click Here!
            </a>
          </b>
        </p>`,
  };
  transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
};

const createBoard = async ({ user, boardName, icon, background }) => {
  const boardWithSameName = await Board.findOne({
    user: user._id,
    name: boardName,
  });
  if (boardWithSameName) {
    throw new Error("Name already in use");
  }
  const board = new Board({
    user: user._id,
    name: boardName,
    icon: icon,
    background: background,
  });
  await board.save();
  return board;
};
const getBoards = async ({ user }) => {
  const boards = await Board.find({ user: user._id }).populate({
    path: "columns",
    populate: {
      path: "cards",
      model: "cards",
    },
  });
  return boards;
};
const editBoard = async ({ boardId, boardName, icon, background }) => {
  const update = { name: boardName, icon: icon, background: background };
  const result = await Board.findOneAndUpdate(
    { _id: boardId },
    { $set: update },
    { new: true }
  );
  if (!result) throw new Error("Board not found");
  return result;
};
const deleteBoard = async ({ boardId }) => {
  const result = await Board.findOneAndDelete(boardId);
  if (!result) throw new Error("Board not found");
  console.log(result);
  return result;
};

const createColumn = async ({ boardId, columnName }) => {
  console.log(boardId);
  console.log(columnName);
  const columnWithSameName = await Column.findOne({
    owner: boardId,
    name: columnName,
  });
  if (columnWithSameName) {
    throw new Error("Name already in use");
  }
  const column = new Column({
    name: columnName,
    owner: boardId,
  });
  await column.save();
  await Board.findByIdAndUpdate(boardId, { $push: { columns: column._id } });
  return column;
};
const editColumn = async ({ id, columnName }) => {
  const update = { name: columnName };
  const result = await Column.findOneAndUpdate(
    { _id: id },
    { $set: update },
    { new: true }
  );
  if (!result) throw new Error("Column not found");
  return result;
};

const deleteColumn = async ({ id }) => {
  try {
    // Găsește și șterge coloana
    const deletedColumn = await Column.findByIdAndDelete(id);

    if (!deletedColumn) {
      throw new Error("Column not found");
    }

    // Șterge toate cardurile asociate acestei coloane
    const deletedCards = await Card.deleteMany({ owner: id });

    if (!deletedCards) {
      throw new Error("Error deleting cards associated with the column");
    }

    return { deletedColumn, deletedCards };
  } catch (error) {
    throw new Error(error.message);
  }
};
const createCard = async ({
  columnId,
  title,
  description,
  labelColor,
  deadline,
}) => {
  const card = new Card({
    title: title,
    description: description,
    labelColor: labelColor,
    deadline: deadline,
    owner: columnId,
  });
  await card.save();
  await Column.findByIdAndUpdate(columnId, { $push: { cards: card._id } });
  return card;
};
const editCard = async ({ id, title, description, labelColor, deadline }) => {
  const update = {
    title: title,
    description: description,
    labelColor: labelColor,
    deadline: deadline,
  };
  const result = await Card.findOneAndUpdate(
    { _id: id },
    { $set: update },
    { new: true }
  );
  if (!result) throw new Error("Card not found");
  return result;
};
const deleteCard = async ({ id }) => {
  const card = await Card.findById(id);
  const columnId = card.owner;

  const updatedColumn = await Column.findByIdAndUpdate(
    columnId,
    { $pull: { cards: id } },
    { new: true }
  );
  if (!updatedColumn) {
    throw new Error("Column not found");
  }
  await updatedColumn.save();
  const result = await Card.findByIdAndDelete(id);
  if (!result) throw new Error("Card not found");
  return result;
};
const moveCardToColumn = async ({ cardId, newColumnId }) => {
  const card = await Card.findById(cardId);

  if (!card) {
    throw new Error("Card not found");
  }

  const oldColumn = await Column.findById(card.owner);
  if (!oldColumn) {
    throw new Error("Old column not found");
  }

  oldColumn.cards.pull(cardId);
  await oldColumn.save();

  const newColumn = await Column.findById(newColumnId);
  if (!newColumn) {
    throw new Error("New column not found");
  }

  newColumn.cards.push(cardId);
  await newColumn.save();

  card.owner = newColumnId;

  // Salvează cardul
  await card.save();

  return {
    card,
    oldColumnId: oldColumn._id, // Adaugă oldColumnId în răspuns
    newColumnId,
  };
};

const getBackgroundImages = async () => {
  const images = await BackgroundImages.find();
  return images;
};
module.exports = {
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
};
