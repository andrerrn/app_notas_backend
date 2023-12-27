import { RequestHandler } from "express";
import NoteModel from "../models/note";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { assertIsDefined } from "../util/assertIsDefined";

export const getNotes: RequestHandler =  async (req, res, next) => {
    const authenticatedUserId = req.session.userId;
    try {
        assertIsDefined(authenticatedUserId);

        const notes = await NoteModel.find({userId: authenticatedUserId}).exec();
        res.status(200).json(notes);

    } catch (error) {
        next(error);
    }
    
}

export const getNote: RequestHandler =  async (req, res, next) => {
    const noteId = req.params.noteId;
    const authenticatedUserId = req.session.userId;
    try {

        assertIsDefined(authenticatedUserId);

        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Id invalido");
            
        }

        const note = await NoteModel.findById(noteId).exec();
        res.status(200).json(note);

        if (!note) {
            throw createHttpError(404, "Nota não encontrada");

        if (!note?.userId.equals(authenticatedUserId)) {
                throw createHttpError(401, "Você não tem acesso a essa nota.")
        }
            
        }
    } catch (error) {
        next(error);
    }
}

interface CreateNoteBody {
    title?: string,
    text?: string,
}

export const createNote: RequestHandler<unknown, unknown, CreateNoteBody, unknown> = async (req, res, next) => {
    const title = req.body.title;
    const text = req.body.text;
    const authenticatedUserId = req.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        if (!title) {
            throw createHttpError(400, "Precisa ter um título");
            
        }
        const newNote = await NoteModel.create({
            userId: authenticatedUserId,
            title: title,
            text: text,
        });

        res.status(201).json(newNote);
    } catch (error) {
        next(error);
    }
}

interface updateNoteParams {
    noteId: string,
}

interface updateNoteBody {
    title?: string,
    text?: string,
}

export const updateNote: RequestHandler<updateNoteParams, unknown, updateNoteBody, unknown> = async(req, res, next) => {
    const noteId = req.params.noteId;
    const newTitle = req.body.title;
    const newText = req.body.text;
    const authenticatedUserId = req.session.userId;
    
    try {
        assertIsDefined(authenticatedUserId);
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Id invalido");
        }

        if (!newTitle) {
            throw createHttpError(400, "Precisa ter um título");
                
        }

        const note = await NoteModel.findById(noteId).exec();

        if (!note) {
            throw createHttpError(404, "Nota não encontrada");
            
        }

        if (!note.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, "Você não tem acesso a essa nota.")
        }

        note.title = newTitle;
        note.text = newText;

        const updateNote = await note.save();
        res.status(200).json(updateNote);

    } catch (error) {
        next(error);
        
    }
}

export const deleteNote: RequestHandler = async (req, res, next) => {
    const noteId = req.params.noteId;
    const authenticatedUserId = req.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Id invalido");
        }

        const note = await NoteModel.findById(noteId).exec();
        if (!note) {
            throw createHttpError(404, "Nota não encontrada"    );
            
        }

        if (!note.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, "Você não tem acesso a essa nota.")
        }

        await note.deleteOne({ _id: noteId });

        res.sendStatus(204);

    } catch (error) {
        next(error);
    }

}