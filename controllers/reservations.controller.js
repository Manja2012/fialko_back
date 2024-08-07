import Reservation from "../models/reservation.model.js";
import nodemailer from "nodemailer";
import { env } from "../config.js";

const transport = nodemailer.createTransport({
  host: env.mailHost,
  port: env.mailPort,
  secure: false,
  auth: {
    user: env.mailUser,
    pass: env.mailPassword,
  },
});

export const addReservation = async (req, res) => {
  try {
    console.log(req.body);
    const reservation = await Reservation.create(req.body);

    await transport.sendMail({
      from: env.mailUser,
      to: "mdemko2012@gmail.com",
      subject: "Confirmer la reservation",
      text: `
        Vous avez réservé votre cours avec succès `,
      html: `<p>Vous avez réservé votre cours avec succès</p>`,
    });

    res.status(201).json(reservation);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Erreur lors de l'envois",
      trace: err,
    });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Error lors de la récupération" });
  }
};

export const getByIdReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const reservation = await Reservation.findById(id);
    res.status(200).json(reservation);
  } catch (err) {
    res.status(500).json({ error: "Error lors de la récupération" });
  }
};

export const updateByIdReservation = async (req, res) => {
  try {
    const getReservation = await Reservation.findById(req.params.id);
    if (!getReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    if (parseInt(getReservation.id) == parseInt(req.user.id)) {
      const reservation = await Reservation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      return res.status(200).json(reservation);
    } else {
      return res
        .status(403)
        .json({ error: "Seul le créateur peut modifier !" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error lors de la récupération", message: err.message });
  }
};

export const deleteByIdReservation = async (req, res) => {
  try {
    const getReservation = await Reservation.findById(req.params.id);
    if (!getReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    if (parseInt(getReservation.id) == parseInt(req.user.id)) {
      const reservation = await Reservation.findByIdAndDelete(req.params.id);
      res.status(200).json("Reservation deleted ! ");
    } else {
      return res
        .status(403)
        .json({ error: "Seul le créateur peut supprimer !" });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const checkReservation = async (req, res) => {
  const courseId = req.params.idcourse;
  console.log("A", req.user);
  const userId = req.user.id;

  if (!userId || !courseId) {
    return res.status(400).json({ error: "Missing userId or courseId" });
  }

  try {
    const reservation = await Reservation.findOne({
      user: userId,
      course: courseId,
    });

    if (reservation) {
      return res.status(200).json({ hasReserved: true });
    } else {
      return res.status(200).json({ hasReserved: false });
    }
  } catch (error) {
    console.error("Error checking reservation:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllReservationByUser = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  try {
    const reservationsByUser = await Reservation.find({
      user: userId,
    }).populate("course");
    res.status(200).json(reservationsByUser);
  } catch (error) {
    console.error("Error getting reservation by user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
