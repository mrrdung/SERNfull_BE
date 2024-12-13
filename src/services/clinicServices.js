import { where } from "sequelize";
import db from "../models";
let createNewClinicSV = data => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.name ||
                !data.address ||
                !data.imageBase64 ||
                !data.descriptionHTML ||
                !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "missing require parameter",
                });
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                });
                resolve({
                    errCode: 0,
                    errMessage: "ok",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
let getAllClinicSV = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll({});
            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, "base64").toString("binary");
                    return item;
                });
            }
            resolve({
                data: data,
                errCode: 0,
                errMessage: "get Clinic ok",
            });
        } catch (e) {
            reject(e);
        }
    });
};
let getDetailClinicByIdSV = inputId => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "missing require parameter",
                });
            } else {
                let data = await db.Clinic.findOne({
                    where: {
                        id: inputId,
                    },
                    attributes: ["name", "address", "descriptionHTML", "descriptionMarkdown"],
                });
                if (data) {
                    let doctorClinic = [];
                    doctorClinic = await db.Doctor_Infor.findAll({
                        where: {
                            clinicId: inputId,
                        },
                        attributes: ["provinceId", "doctorId"],
                    });
                    data.doctorClinic = doctorClinic;
                } else {
                    data = {};
                }
                resolve({
                    data: data,
                    errCode: 0,
                    errMessage: "ok",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    createNewClinicSV,
    getAllClinicSV,
    getDetailClinicByIdSV,
};
