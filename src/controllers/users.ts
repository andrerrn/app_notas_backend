import { RequestHandler} from "express";
import createHttpError from "http-errors";
import userModel from "../models/user";
import bcrypt from "bcrypt";
import { log } from "console";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.session.userId).select("+email").exec();
        res.status(200).json(user);
    } catch (error) {
        next (error);
    }
}


interface SignUpBody {
    username?: string,
    email?: string,
    password?: string,
}

export const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const passwordRaw = req.body.password;
    try {
        if (!username || !email || !passwordRaw)  {
            throw createHttpError(400, "Falta preencher parâmetro");
        }

        const existingUserName = await userModel.findOne({username: username}).exec();
        if (existingUserName) {
            throw createHttpError(409, "Username já utilizado. Por favor, procure um novo.");
        }

        const existingEmail = await userModel.findOne({email: email}).exec();

        if (existingEmail) {
            throw createHttpError(409, "Esse email já existe. Por favor faça o login.")
            
        }

        const passwordHash = await bcrypt.hash(passwordRaw, 10);

        const newUser = await userModel.create({
            username: username,
            email: email,
            password: passwordHash,
        });

        req.session.userId = newUser._id;

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
    
};

interface LoginBody {
    username?: string,
    password?: string,
}

export const login: RequestHandler <unknown, unknown,LoginBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        console.log("Received login request");
        if (!username || !password) {
            throw createHttpError(400, "Está faltando preencher algo.");
            
        }

        const user = await userModel.findOne({username: username}).select("+password +email").exec();
        
        if (!user) {
            throw createHttpError(401, "Credenciais invalidas");
        }

        const passwordHash = await bcrypt.compare(password,user.password);

        if (!passwordHash) {
            throw createHttpError(401, "Credenciais Invalidas");
        }

        req.session.userId = user._id;
        console.log("Sending response:", user);
        res.status(201).json(user);

    } catch (error) {
        next(error);
    }
};

export const logout: RequestHandler = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(200);
        }
    });
};