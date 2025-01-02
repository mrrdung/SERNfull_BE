import { where } from "sequelize";
import db from "../models";
import emailService from "../services/emailService";
import { v4 as uuidv4 } from "uuid";

let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
    return result;
};

let postBookAppointmentSV = async data => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.email ||
                !data.doctorId ||
                !data.timeType ||
                !data.birthday ||
                !data.fullName ||
                !data.address ||
                !data.gender
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing require a parameter",
                });
            } else {
                let token = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
                await emailService.sendSimpleEmail({
                    receiversEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token),
                });
                //upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: "R3",
                        firstName: data.fullName,
                        address: data.address,
                        gender: data.gender,
                    },
                });

                if (user && user[0]) {
                    // await db.Booking.findOrCreate({
                    //     where: { patientId: user[0].id,  },
                    //     defaults: {
                    //         statusId: "s1",
                    //         doctorId: data.doctorId,
                    //         patientId: user[0].id,
                    //         birthday: data.birthday,
                    //         timeType: data.timeType,
                    //         date: data.date,
                    //         token: token,
                    //     },
                    // });
                    await db.Booking.create({
                        statusId: "s1",
                        doctorId: data.doctorId,
                        patientId: user[0].id,
                        birthday: data.birthday,
                        timeType: data.timeType,
                        date: data.date,
                        token: token,
                    });
                }
                resolve({
                    errCode: 0,
                    errMessage: "Save Info doctor succes",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
let verifyBookAppointmentSV = data => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "missing require parameter",
                });
            } else {
                let appointment = await db.Booking.findOne({
                    where: { doctorId: data.doctorId, token: data.token, statusId: "S1" },
                    raw: false, //update dc
                });
                if (appointment) {
                    appointment.statusId = "S2";
                    await appointment.save();
                    resolve({
                        errCode: 0,
                        errMessage: "Active appoimenr success",
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appoimenr has been activated or does not exit ",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    postBookAppointmentSV,
    verifyBookAppointmentSV,
};
