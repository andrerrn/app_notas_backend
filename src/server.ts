import app from "./app";
import mongoose from "mongoose";
import env from "./util/validateEnv";

const port = env.PORT;

mongoose.connect(env.MONGO_CONNECTION_STRING)
.then(() => {
    console.log("Mongoose conectado")

    app.listen(port, () => {
        console.log("Servidor rodando na porta: " + port);
    });
})
.catch(console.error
);

