import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import avatar from '../assets/profile.png'
import toast, { Toaster } from 'react-hot-toast';
import { useFormik } from 'formik';

import { passwordValidate } from '../helper/validate';
import useFetch from '../hooks/fetch.hook';
import { useAuthStore } from '../store/store';
import { verfiyPassword } from '../helper/helper';

import styles from '../styles/Username.module.css'


const Password = () => {
  
  const {username} = useAuthStore(state => state.auth); 
  const [{ isLoading, apiData, serverError }] = useFetch(`/user/${username}`)
  const navigate = useNavigate();


  const formik = useFormik({
    initialValues: {
      password:''
    },
    validate: passwordValidate ,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async values => {
      let loginPromise = verfiyPassword({ username, password: values.password });
      toast.promise(loginPromise, {
        loading: "Verifying Password",
        success: <b>Login successful</b>,
        error: <b>Password incorrect!</b>

      });
      loginPromise.then(res => {
        let { token } = res.data;
        localStorage.setItem('token', token);
        navigate('/profile');

        
      })
    }
  })

  if (isLoading) return <h1 className='text-2xl font-bold'>Loading</h1>;
  if (serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>

  return (
    <div className="container mx-auto">
      <Toaster position='top-center' reverseOrder={false}>

      </Toaster>
      <div className="flex justify-center items-center h-screen">
        <div className={styles.glass}>

          <div className="title flex flex-col items-center">

            <h4 className='text-5xl font-bold'>Hello {apiData?.firstName || username}!</h4>

            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>Explore more by connecting with us.</span>
            
          </div>

          <form className='py-1' onSubmit={formik.handleSubmit}>
            <div className="profile flex justify-center py-4">
              <img src={apiData?.profile || avatar} alt="avatar" className={styles.profile_img} />

            </div>
            <div className="textbox flex flex-col items-center gap-6">
              <input {...formik.getFieldProps('password')} type="password" placeholder='Password' className={styles.textbox}  />
              <button type='submit' className={styles.btn}>Sign In</button>
            </div>
            <div className="text-center py-4">
              <span className='text-gray-500'>Forgot password? <Link to="/recovery" className='text-red-500'>Recover Now</Link></span>

            </div>

          </form>

        </div>
      </div>
    </div>
  )
}

export default Password
