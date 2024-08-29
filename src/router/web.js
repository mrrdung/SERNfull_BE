import express from 'express';
import homeController from "../controllers/homeController";
import userController from '../controllers/userController';

const router = express.Router();

let initWebRouters = (app) => {
    router.get("/", homeController.getHomePage);
    router.get("/add", homeController.getMrrDung);

    router.post("/post-CRUD", homeController.postCRUD);
    router.get("/get-CRUD", homeController.displayUser);
    router.get("/edit-CRUD", homeController.editCRUDUser)

    router.post("/put-CRUD", homeController.putCRUDUser)
    router.get("/delete-CRUD", homeController.deleteCRUDUser)

    //API
    router.post("/api/login", userController.handleLogin)
    router.get("/api/get-all-users", userController.handleGetAllUsers);
    return app.use("/", router);
}




module.exports = initWebRouters;