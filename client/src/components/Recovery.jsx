import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useFormik } from 'formik';

import { useAuthStore } from '../store/store';
import { passwordValidate } from '../helper/validate';
import { generateOTP, verifyOTP } from '../helper/helper';

import styles from '../styles/Username.module.css'


const Recovery = () => {

  const { username } = useAuthStore(state => state.auth);
  const [OTP, setOTP] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    generateOTP(username).then((OTP) => {
      if (OTP) return toast.success('OTP has been sent. Check Email');

      return toast.error('Problem while generating OTP');
    })
  }, [username]);



  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      let { status } = await verifyOTP({ username, code: OTP });

      if (status === 201) {
        toast.success('Verified Successfully!');
        return navigate('/reset');
      }
    } catch (error) {
      return toast.error('Invalid OTP! Check email for correct OTP.')
    }
  };

  //handler function to resend OTP
  const resendOTP = () => {
    let sendPromise = generateOTP(username);

    toast.promise(sendPromise, {
      loading: "Sending ...",
      success: <b>OTP has been sent to your email</b>,
      error: <b>Could not send OTP. Please try again</b>

    });

    sendPromise.then(OTP => {
      //console.log({ OTP })
    })
  }
  


  return (
    <div className="container mx-auto">
      <Toaster position='top-center' reverseOrder={false}>

      </Toaster>

      <div className="flex justify-center items-center h-screen">
        <div className={styles.glass}>

          <div className="title flex flex-col items-center">

            <h4 className='text-5xl font-bold'>Recovery</h4>

            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>Enter OTP to recover password.</span>
            
          </div>

          <form className='pt-20' onSubmit={onSubmit}>
            
            <div className="textbox flex flex-col items-center gap-6">
              <div className="input text-center">
                <span className='py-4 text-sm text-left text-gray-500 '>Enter 6 digit OTP sent to your email address</span>
                <input onChange={(e) => setOTP(e.target.value)} type="text" placeholder='OTP' className={styles.textbox} />
              </div>
              
              <button type='submit' className={styles.btn}>Sign In</button>
            </div>
            

          </form>
          <div className="text-center py-4">
            <span className='text-gray-500'>Cant get OTP? <button className='text-red-500' onClick={resendOTP}>Resend</button></span>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Recovery

