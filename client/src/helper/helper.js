import axios from 'axios';
import jwt_decode from 'jwt-decode';


axios.defaults.baseURL = 'http://localhost:8080';

/**Make API request */


/**To get username from token */
export async function getUsername() {
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject("Cannot find token");

    let decode = jwt_decode(token);
   
    return decode;

}


//authenticate function

export async function authenticate(username) {
    try {
        return await axios.post('/api/authenticate', {username})
    } catch (error) {
        return {error: "Username doesnt exist"}
    }
}


/**get user details */
export async function getUser({ username }) {
    try {
        const { data } = await axios.get(`/api/user/${username}`);
        return { data };
    } catch (error) {
        return {error:"Password doesnt match"}
    }    
}

/**Register user */
export async function registerUser(credentials) {
    try {
        const { data: { msg }, status } = await axios.post(`/api/register`, credentials);
        
        let { username, email } = credentials;

        /**send email */
        if (status === 201) {
            await axios.post('/api/registerMail', {username, userEmail: email, text:msg})
        }

        return Promise.resolve(msg);

    } catch (error) {
        return Promise.reject({error})
    }
    
}

/**Login user */
export async function verfiyPassword({ username, password }) {
    try {
        if (username) {
            const { data } = await axios.post('/api/login', { username, password })
            
            return Promise.resolve({ data });
        }
    } catch (error) {
        return Promise.reject({error: "Password doesnt match"})
    }
    
}

/**Update user profile - PUT */
export async function updateUser(response) {

    try {
        const token = await localStorage.getItem('token');
        const data = await axios.put(`/api/updateuser`, response, { headers: { "Authorization": `Bearer ${token}` } });

        return Promise.resolve({data})
    } catch (error) {
        return Promise.reject({error:"Couldnt update profile"})
    }

    
}

/**Generate OTP */
export async function generateOTP(username) {
    try {
        const { data: { code }, status } = await axios.get('/api/generateOTP', { params: { username } });

        //send mail with the OTP
        if (status === 201) {
            let { data: { email } } = await getUser({ username });
            let text = `Your Password recovery OTP is ${code}. Verify and recover password`;
            await axios.post('/api/registerMail', { username, userEmail: email, text, subject: "Password Recovery OTP" });
        }

        return Promise.resolve(code);
    } catch (error) {
        return Promise.reject({error})
    }
    
}

/**Verify OTP */
export async function verifyOTP({ username, OTP }) {
    try {
        const { data, status } = await axios.get('/api/verifyOTP', { params: { username, OTP } });

        return {data, status}

    } catch (error) {
        return Promise.reject(error)
    }
}

/**reset password */
export async function resetPassword({ username, password }) {
    try {
        const { data, status } = await axios.put('/api/resetPassword', { username, password })
        return Promise.resolve({ data, status });
        
    } catch (error) {
        return Promise.reject({error})
    }
}



