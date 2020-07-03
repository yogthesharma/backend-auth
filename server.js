const express = require(`express`);
require(`./db/mongoose`);

// importing models
const userRouter = require(`./routes/userRoute`);

const app = express();

// using app schedules
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.use(userRouter);

const port = process.env.PORT || 5000;

// listinging on the port
app.listen(port, () => {
  console.log(`Server Started On Port ${port}`);
});
