import UserModel from '../model/User.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ENV from '../config.js'
import otpGenerator from 'otp-generator'

/**middleware to verify user */
export async function verifyUser(req, res, next) {
    try {
        const { username } = req.method === "GET" ? req.query : req.body;

        //check username exist
        let exist = await UserModel.findOne({ username });
        if (!exist) return res.status(404).send({ error: "Cant find user" });
        next();

    } catch (error) {
        return res.status(404).send({error: "Authentication error"})
    }
}

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) { 
 
    try {
        const { username, password, profile, email } = req.body;      
        
        //check existing users
        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({ username }, function (error, user) {
                if (error) reject(new Error(error))
                if (user) reject({ error: "Please use unique username" })
                
                resolve();
            })
            
        })

        //check existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email }, function (error, user) {
                if (error) reject(new Error(error))
                if (user) reject({ error: "Email already in use. Try logging in instead." })
                
                resolve();
            })
            
        });

        Promise.all([existUsername, existEmail]).then(() => {
            if (password) {
                bcrypt.hash(password, 20).then(hashedPassword => {
                    const user = new UserModel({
                        username,
                        password: hashedPassword,
                        profile: profile || '',
                        email
                    })

                    //return and save result as a response
                    user.save()
                        .then(result => res.status(201).send({ msg: "User registered successfully" }))
                        .catch(error => res.status(500).send({ error: "error saving user" }));
                    
                }).catch(error => {
                    return res.status(500).send({
                        error: "Unable to hash password"
                    })
                })
            }
            
        }).catch(error => {
            return res.status(500).send({
                error
            })
        })
        

        
 
    } catch (error) {
        return res.status(500).send(error);
    
    }
}


/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {

    const { username, password } = req.body;

    try {
        
        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {
                        if (!passwordCheck) return res.status(400).send({ error: "Dont have a password" })

                        //create jwt token
                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username
                        }, ENV.JWT_SECRET, { expiresIn: "24h" });

                        return res.status(200).send({ message: "Login successful!", username: user.username, token });
                    })
                    .catch(error => {
                        return res.status(400).send({ error: "Invalid credentials" })
                    })
                
            })
            .catch(error => {
                return res.status(500).send({ error: "Invalid credentials" });
            })
        
    } catch (error) {
        return res.status(500).send({error})        
    }
}

/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
    const { username } = req.params;

    try {
        if (!username) return res.status(501).send({ error: "Invalid username" });

        UserModel.findOne({ username }, (error, user) => {
            if (error) return res.status(500).send({ error })
            if (!user) return res.status(501).send({ error: "Couldnt find the user" });

            //remove password from user and convert to JSON object/return to object

            const { password, ...other } = Object.assign({}, user.toJSON())

            return res.status(201).send(other);
            
        })
        
    } catch (error) {
        return res.status(404).send({ error: "Cannot find User Data" });
    }

}


/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
    try {
        //const id = req.query.id;
        const { userId } = req.user;
        
        if (userId) {
            const body = req.body;

            //update data
            UserModel.updateOne({ _id: userId }, body, (error, data) => {
                if (error) throw error;

                return res.status(201).send({ msg: "User updated succesfully" });
            })
            
        } else {
            return res.status(401).send({error: "User not found"})
        }
    } catch (error) {

        return res.status(401).send({error})
        
    }
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    res.status(201).send({ code: req.app.locals.OTP})


}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true //start session for reset password
        
        return res.status(201).send({msg: "Verified succesfully"})
    };

    return res.status(400).send({ error: "invalid OTP" });
}



// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
    if (req.app.locals.resetSession) {

        return res.status(201).send({ flag: req.app.locals.resetSession});
    }

    return res.status(440).send({ msg: "Session expired" });

}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
    try {
        const { username, password } = req.body;

        try {

            UserModel.findOne({ username })
                .then(
                    user => {
                        bcrypt.hash(password, 10)
                            .then(
                                hashedPassword => {
                                    UserModel.updateOne(
                                        { username: user.username },
                                        { password: hashedPassword }, (err, data) => {
                                            if (err) throw err;
                                            return res.status(201).send({ msg: "Password updated" });
                                        })
                                }
                            )
                            .catch(error => {
                                return res.status(500).send({
                                    error: "Unable to hash password"
                                })
                            })
                    }
                )
                .catch(error => {
                return res.status(404).send({error: "user not found"})
            })

        } catch (error) {
            return res.status(500).send({error})
        }
    } catch (error) {
        return res.status(401).send({error})
    }
}








