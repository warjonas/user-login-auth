import { Router } from "express";
const router = Router();

/**Import all controllers */
import * as controller from '../controllers/appController.js'
import Auth, { localVariables } from '../middleware/auth.js'
import { registerMail } from "../controllers/mail.js";


/**POST Methods */
router.route('/register').post(controller.register)
router.route('/registerMail').post(registerMail) // send email after registration
router.route('/authenticate').post(controller.verifyUser, (req, res) => res.end());
router.route('/login').post(controller.verifyUser, controller.login);


/**GET Methods */
router.route('/user/:username').get(controller.getUser) //user with username
router.route('/generateOTP').get(controller.verifyUser, localVariables, controller.generateOTP); //generate random OTP
router.route('/verifyOTP').get(controller.verifyOTP) //verify generated OTP
router.route('/createResetSession').get(controller.createResetSession) //reset all the variables


/**PUT Methods */
router.route('/updateuser').put(Auth, controller.updateUser)
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword)




export default router;