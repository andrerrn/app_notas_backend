import express from "express";
import * as NotesCroller from "../controllers/notes";

const router = express.Router();

router.get("/", NotesCroller.getNotes);

router.get("/:noteId", NotesCroller.getNote);

router.post("/", NotesCroller.createNote);

router.patch("/:noteId", NotesCroller.updateNote);

router.delete("/:noteId", NotesCroller.deleteNote);

export default router;