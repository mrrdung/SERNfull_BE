const { raw } = require("body-parser");
import { where } from "sequelize";
import db from "../models";
require("dotenv").config();
import _ from "lodash";
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = limitInput => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                order: [["createdAt", "DESC"]],
                where: { roleId: "R2" },
                attributes: {
                    exclude: ["password"],
                },
                include: [
                    { model: db.Allcode, as: "positionData", attributes: ["valueEn", "valueVi"] },
                    { model: db.Allcode, as: "genderData", attributes: ["valueEn", "valueVi"] },
                ],
                raw: true,
                nest: true,
            });
            resolve({
                errCode: 0,
                data: users,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: "R2" },
                attributes: { exclude: ["password", "image"] },
            });

            resolve({
                errCode: 0,
                data: doctors,
            });
        } catch (e) {
            reject(e);
        }
    });
};
let checkRequiredFields = inputData => {
    let arrFields = [
        "doctorId",
        "contentHTML",
        "contentMarkdown",
        "action",
        "selectedPrice",
        "selectedPayment",
        "selectedProvince",
        "nameClinic",
        "addressClinic",
    ];
    let isValid = true;
    let element = "";
    for (let i = 0; i < arrFields.length; i++) {
        if (!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i];
            break;
        }
    }
    return { isValid: isValid, element: element };
};
let saveInfoDoctor = inputData => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkObj = checkRequiredFields(inputData);
            console.log(checkObj);

            if (checkObj.isValid === false) {
                resolve({
                    errCode: "1",
                    errMessage: `Missing paramter ${checkObj.element}`,
                });
            } else {
                if (inputData.action === "CREATE") {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId,
                    });
                } else if (inputData.action === "EDIT") {
                    let doctor = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false,
                    });
                    if (doctor) {
                        doctor.contentHTML = inputData.contentHTML;
                        doctor.contentMarkdown = inputData.contentMarkdown;
                        doctor.description = inputData.description;
                        await doctor.save();
                    }
                }
                // upsert to doctor_info table

                let doctorInfo = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: inputData.doctorId,
                    },
                    raw: false,
                });
                if (doctorInfo) {
                    //update

                    doctorInfo.priceId = inputData.selectedPrice;
                    doctorInfo.paymentId = inputData.selectedPayment;
                    doctorInfo.provinceId = inputData.selectedProvince;
                    doctorInfo.addressClinic = inputData.nameClinic;
                    doctorInfo.nameClinic = inputData.addressClinic;
                    doctorInfo.note = inputData.note;
                    doctorInfo.specialtyId = inputData.specialtyId;
                    doctorInfo.clinicId = inputData.clinicId;

                    await doctorInfo.save();
                } else {
                    //create
                    await db.Doctor_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        paymentId: inputData.selectedPayment,
                        provinceId: inputData.selectedProvince,
                        addressClinic: inputData.nameClinic,
                        nameClinic: inputData.addressClinic,
                        note: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId,
                    });
                }

                resolve({
                    errCode: 0,
                    errMessage: "save ok",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
let getDetailDoctorById = inputId => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter",
                });
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId,
                    },
                    attributes: {
                        exclude: ["password"], //loai bo
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ["description", "contentHTML", "contentMarkdown"],
                        },
                        { model: db.Allcode, as: "positionData", attributes: ["valueEn", "valueVi"] },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ["id", "doctorId"],
                            },

                            // attributes: ["description", "contentHTML", "contentMarkdown"],
                            include: [
                                { model: db.Allcode, as: "priceData", attributes: ["valueEn", "valueVi"] },
                                { model: db.Allcode, as: "provinceData", attributes: ["valueEn", "valueVi"] },
                                { model: db.Allcode, as: "paymentData", attributes: ["valueEn", "valueVi"] },
                            ],
                        },
                    ],
                    raw: false,
                    nest: true,
                });
                if (data && data.image) {
                    data.image = new Buffer(data.image, "base64").toString("binary");
                }
                if (!data) {
                    data = {};
                }
                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
let bulkCreateScheduleSv = data => {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log("data", data);

            if (!data.arrSchedule || !data.doctorId || !data.formatDate) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing Parameter",
                });
            } else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    });
                } //get all date existing data
                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.formatDate },
                    attributes: ["timeType", "date", "doctorId", "maxNumber"],
                    raw: true,
                });

                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && a.date === Number(b.date);
                });
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }
            }

            resolve({
                errCode: 0,
                errMessage: "push schedule ok",
            });
        } catch (e) {
            reject(e);
        }
    });
};
let getScheduleDoctorByDateSV = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing require parameter",
                });
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: { doctorId: doctorId, date: date },
                    include: [
                        { model: db.Allcode, as: "timeTypeData", attributes: ["valueVi", "valueEn"] },
                        { model: db.User, as: "doctorData", attributes: ["firstName", "lastName"] },
                    ],
                    raw: false,
                    nest: true,
                });
                if (!dataSchedule) {
                    dataSchedule = [];
                }

                resolve({
                    errCode: 0,
                    data: dataSchedule,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
let getExtraInforDoctorByIdSV = inputId => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing require parameter",
                });
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: { doctorId: inputId },
                    attributes: {
                        exclude: ["id", "doctorId"],
                    },

                    include: [
                        { model: db.Allcode, as: "priceData", attributes: ["valueEn", "valueVi"] },
                        { model: db.Allcode, as: "provinceData", attributes: ["valueEn", "valueVi"] },
                        { model: db.Allcode, as: "paymentData", attributes: ["valueEn", "valueVi"] },
                    ],
                    raw: true,
                    nest: true,
                });
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
let getProfileInforDoctorByIdSV = doctorId => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing Require a Parameter",
                });
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: doctorId,
                    },
                    attributes: {
                        exclude: ["password"], //loai bo
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ["description", "contentHTML", "contentMarkdown"],
                        },
                        { model: db.Allcode, as: "positionData", attributes: ["valueEn", "valueVi"] },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ["id", "doctorId"],
                            },

                            // attributes: ["description", "contentHTML", "contentMarkdown"],
                            include: [
                                { model: db.Allcode, as: "priceData", attributes: ["valueEn", "valueVi"] },
                                { model: db.Allcode, as: "provinceData", attributes: ["valueEn", "valueVi"] },
                                { model: db.Allcode, as: "paymentData", attributes: ["valueEn", "valueVi"] },
                            ],
                        },
                    ],
                    raw: false,
                    nest: true,
                });
                if (data && data.image) {
                    data.image = new Buffer(data.image, "base64").toString("binary");
                }
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
let getListPatientForDoctorSV = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("check inputdate", doctorId);

            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing Require a Parameter",
                });
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: "S2",
                        doctorId: doctorId,
                        date: date,
                    },
                    include: [
                        {
                            model: db.User,
                            as: "patientData",
                            attributes: ["email", "firstName", "address", "gender"],
                            include: [{ model: db.Allcode, as: "genderData", attributes: ["valueEn", "valueVi"] }],
                        },
                        {
                            model: db.Allcode,
                            as: "timeTypeDataPatient",
                            attributes: ["valueEn", "valueVi"],
                        },
                    ],
                    raw: false,
                    nest: true,
                });
                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
let sendRemedySV = data => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing Require a Parameter",
                });
            } else {
                //update stt patient
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: "S2",
                    },
                    raw: false,
                });
                if (appointment) {
                    appointment.statusId = "S3";
                    await appointment.save();
                }
                //send email
                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveInfoDoctor: saveInfoDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateScheduleSv,
    getScheduleDoctorByDateSV,
    getExtraInforDoctorByIdSV,
    getProfileInforDoctorByIdSV,
    getListPatientForDoctorSV,
    sendRemedySV,
};
