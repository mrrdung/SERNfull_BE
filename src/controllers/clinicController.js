import clinicService from "../services/clinicServices";

let createNewClinic = async (req, res) => {
    try {
        let info = await clinicService.createNewClinicSV(req.body);

        return res.status(200).json(info);
    } catch (e) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Error server",
        });
    }
};
let getAllClinic = async (req, res) => {
    try {
        let info = await clinicService.getAllClinicSV();

        return res.status(200).json(info);
    } catch (e) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Error server",
        });
    }
};
let getDetailClinicById = async (req, res) => {
    try {
        let info = await clinicService.getDetailClinicByIdSV(req.query.id);

        return res.status(200).json(info);
    } catch (e) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Error server",
        });
    }
};
module.exports = {
    createNewClinic,
    getAllClinic,
    getDetailClinicById,
};
