import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const subscriptionRouter =Router()

subscriptionRouter.route("/subscribe/:channelId").patch(verifyJWT,toggleSubscription)
subscriptionRouter.route("/c/:channelId").get(verifyJWT,getUserChannelSubscribers)
subscriptionRouter.route("/s/:subscriberId").get(verifyJWT, getSubscribedChannels)


export default subscriptionRouter