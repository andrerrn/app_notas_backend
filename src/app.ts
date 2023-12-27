import "dotenv/config";
import  express, { NextFunction, Request, Response}  from "express";
import userRoutes from "./routers/users"
import notesRoutes from "./routers/notes";
import morgan from "morgan";
import createHttpError, {isHttpError} from "http-errors";
import  session  from "express-session";
import env from "./util/validateEnv";
import MongoStore from "connect-mongo";
import { requiresAuth } from "./middleware/auth";

const app = express();
app.use(express.json());
app.use(morgan("dev"));


app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
        mongoUrl: env.MONGO_CONNECTION_STRING
    }),
}));

app.use("/api/users", userRoutes);
app.use("/api/notes", notesRoutes);

app.use((req, res, next) => {
    next(createHttpError(404, "Endpoint não foi encontrado"));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
        console.error(error);
        let errorMessage = "Ocorreu um erro desconhecido";
        let statusCode = 500;
        if (isHttpError(error)) {
            statusCode = error.status;
            errorMessage = error.message;
            
        }
        res.status(statusCode).json({error: errorMessage});
} );

export default app;