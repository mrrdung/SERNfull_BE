import doctorService from "../services/doctorService";

let getTopDoctorHome = async (req, res) => {
    let limit = req.query.limit;

    if (!limit) limit = 10;
    try {
        let response = await doctorService.getTopDoctorHome(+limit);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: "Error from Server",
        });
    }
};
let getAllDoctors = async (req, res) => {
    try {
        let doctors = await doctorService.getAllDoctors();

        return res.status(200).json(doctors);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: "1",
            message: "Error from Server",
        });
    }
};
let postInfoDoctor = async (req, res) => {
    try {
        let response = await doctorService.saveInfoDoctor(req.body);

        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: "1",
            message: "Error from Server",
        });
    }
};
let getDetailDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getDetailDoctorById(req.query.id);

        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: "1",
            message: "Error from Server",
        });
    }
};
let getDetailHistoryById = async (req, res) => {
    try {
        let infor = await doctorService.getDetailHistoryById(req.query.id);

        return res.status(200).json(infor);
    } catch (error) {}
};
let bulkCreateSchedule = async (req, res) => {
    try {
        let infor = await doctorService.bulkCreateScheduleSv(req.body);

        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: "1",
            message: "Error from Server",
        });
    }
};
let getScheduleDoctorByDate = async (req, res) => {
    try {
        let data = await doctorService.getScheduleDoctorByDateSV(req.query.doctorId, req.query.date);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: "1",
            message: "Error from Server",
        });
    }
};
let getExtraInforDoctorById = async (req, res) => {
    try {
        let info = await doctorService.getExtraInforDoctorByIdSV(req.query.doctorId);
        return res.status(200).json(info);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: "1",
            message: "Error from Server",
        });
    }
};
let getProfileInforDoctorById = async (req, res) => {
    try {
        let info = await doctorService.getProfileInforDoctorByIdSV(req.query.doctorId);
        return res.status(200).json(info);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: "1",
            message: "Error from Server",
        });
    }
};
let getListPatientForDoctor = async (req, res) => {
    try {
        let info = await doctorService.getListPatientForDoctorSV(req.query.doctorId, req.query.date);
        return res.status(200).json(info);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: "1",
            message: "Error from Server",
        });
    }
};
let sendRemedy = async (req, res) => {
    try {
        let info = await doctorService.sendRemedySV(req.body);
        return res.status(200).json(info);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: "1",
            message: "Error from Server",
        });
    }
};
module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    postInfoDoctor: postInfoDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule,
    getScheduleDoctorByDate,
    getExtraInforDoctorById,
    getProfileInforDoctorById,
    getListPatientForDoctor,
    sendRemedy,
    getDetailHistoryById,
};
