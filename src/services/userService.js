import { where } from "sequelize";
import db from "../models";
import bcrypt from "bcrypt";
import { raw } from "body-parser";
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
let handleUserLogin = (email, passWord) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);

            if (isExist) {
                let user = await db.User.findOne({
                    attributes: ["id", "email", "firstName", "lastName", "roleId", "password"],
                    where: { email: email },
                    raw: true,
                });
                if (user) {
                    //compare password
                    let check = await bcrypt.compareSync(passWord, user.password);
                    // console.log(user);
                    if (check) {
                        userData.errCode = 0;
                        userData.message = "Pass Ok";
                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.message = "Pass Wrong";
                    }
                } else {
                    userData.errCode = 2;
                    userData.message = "Your not found";
                }
            } else {
                //return error
                userData.errCode = 1;
                userData.message = "Your email isnt exist in your system. Plz try other email !";
            }
            resolve(userData);
        } catch (error) {
            reject(error);
        }
    });
};

let checkUserEmail = userEmail => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({ where: { email: userEmail } });

            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getAllUser = userId => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = "";
            if (userId === "ALL") {
                users = await db.User.findAll();
            }
            if (userId && userId !== "ALL") {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ["password"],
                    },
                });
            }
            resolve(users);
        } catch (error) {
            reject(error);
        }
    });
};

let createNewUser = data => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: "Your email is aready used PLZ try another email!",
                });
            } else {
                let haspasswordbybciipt = await hasUserPassWord(data.password);
                // console.log('check handle pass', haspasswordbybciipt)

                await db.User.create({
                    email: data.email,
                    password: haspasswordbybciipt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar,
                });

                resolve({
                    errCode: 0,
                    errMessage: "Create new user ok!",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let updateUser = data => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("check data nodejs", data);

            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: "Missing required parameted",
                });
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false,
            });
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                if (data.avatar) {
                    user.image = data.avatar;
                }

                await user.save();
                resolve({
                    errCode: 0,
                    errMessage: "update ok",
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: "k tim thay user",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let deleteUser = userId => {
    return new Promise(async (resolve, reject) => {
        try {
            let userdelete = await db.User.findOne({
                where: { id: userId },
            });
            if (!userdelete) {
                resolve({
                    errCode: 2,
                    errMessage: "user not found",
                });
            }

            await db.User.destroy({
                where: { id: userId },
            });
            resolve({
                errCode: 0,
                errMessage: "delete ok",
            });
        } catch (e) {
            reject(e);
        }
    });
};
let hasUserPassWord = password => {
    return new Promise(async (resolve, reject) => {
        try {
            let passwordhas = await bcrypt.hashSync(password, salt);
            resolve(passwordhas);
        } catch (error) {
            reject(error);
        }
    });
};

let getAllCodeService = inputType => {
    return new Promise(async (resolve, reject) => {
        try {
            let res = {};
            let allcode = await db.Allcode.findAll({
                where: { type: inputType },
            });
            res.errCode = 0;
            res.data = allcode;
            resolve(res);
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    handleUserLogin: handleUserLogin,
    checkUserEmail: checkUserEmail,
    getAllUser: getAllUser,
    createNewUser: createNewUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    getAllCodeService: getAllCodeService,
};
