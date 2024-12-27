import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { publishVideo } from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const videoRouter=Router();

videoRouter.route("/publish").post(verifyJWT,
    upload.fields([
            {
                name:"videoFile",
                maxCount:1
            },
            {
                name:"thumbnail",
                maxCount:1
            }
        ]),
    publishVideo)

export default videoRouter