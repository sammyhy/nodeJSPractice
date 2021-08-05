const express = require("express");
const { swaggerUi, specs } = require("./swagger");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
const nunjucks = require("nunjucks");
const multer = require("multer");
const fs = require("fs");

dotenv.config();
const app = express();
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.set("port", process.env.PORT || 3000);
app.set("view engine", "html");

nunjucks.configure("views", {
  express: app,
  watch: true,
});

app.use(morgan("dev"));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    name: "session-cookie",
  })
);

app.use("/", indexRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("not find such a directory, create uploads directory!");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "multipart.html"));
});

app.post(
  "/upload",
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  (req, res) => {
    console.log(req.files, req.body);
    res.send("ok");
  }
);
app.use((req, res, next) => {
  console.log("모든 요청 전부 실행");
  next();
});

app.get(
  "/",
  (req, res, next) => {
    console.log("get / 요청만 실행");
    next();
  },
  (req, res) => {
    //   res.send("Hello, World~~");
    //res.sendFile(path.join(__dirname, "/index.html"));
    throw new Error("에러는 에러 처리 미들웨어로~");
  }
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
