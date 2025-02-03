import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { deleteVideo, getVideoById, publishVideo, updateVideoDetails, togglePublishStatus, getAllVideos } from "../controllers/video.controller.js";
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

videoRouter.route("/:videoId").get(verifyJWT,getVideoById)
videoRouter.route("/update/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideoDetails)
videoRouter.route("/delete/:videoId").delete(verifyJWT,deleteVideo)
videoRouter.route("/publish-details/:videoId").patch(verifyJWT,togglePublishStatus)
videoRouter.route("/user").get(verifyJWT,getAllVideos)

export default videoRouter