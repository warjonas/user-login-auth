import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import avatar from '../assets/profile.png'
import { toast, Toaster } from 'react-hot-toast';
import { useFormik } from 'formik';


import useFetch from '../hooks/fetch.hook';
import convertToBase64 from '../helper/convert';
import { profileValidation } from '../helper/validate';
import styles from '../styles/Username.module.css'
import extend from '../styles/Profile.module.css'
import { useAuthStore } from '../store/store';
import { updateUser } from '../helper/helper';



const Register = () => {
  const [file, setFile] = useState();
  const [{ isLoading, apiData, serverError }] = useFetch()
  const navigate = useNavigate();


  const formik = useFormik({
    initialValues: {
      firstName:apiData?.firstName || '',
      lastName: apiData?.lastName || '',
      email: apiData?.email || '',
      mobile: apiData?.mobile ||'',
      address: apiData?.address || ''
      
    },
    enableReinitialize: true,
    validate: profileValidation ,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async values => {
      values = await Object.assign(values, {profile: file || apiData?.profile || ''})
      let updatePromise = updateUser(values);
      toast.promise(updatePromise, {
        loading: "Updating",
        success: <b>Update Successful</b>,
        error: <b>Update unsuccessful</b>
      })
      console.log(values)
    }
  })

  const onUpload = async e => {
    const base64 = await convertToBase64(e.target.files[0]);
    setFile(base64);
  }

  //logout handler function
  const userLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    
  }

  if (isLoading) return <h1 className='text-2xl font-bold'>Loading</h1>;
  if (serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>

  return (
    <div className="container mx-auto">
      <Toaster position='top-center' reverseOrder={false}>

      </Toaster>
      <div className="flex justify-center items-center h-screen">
        <div className={`${styles.glass} ${extend.glass}`}>

          <div className="title flex flex-col items-center">

            <h4 className='text-5xl font-bold'>Profile</h4>

            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>You can update your details</span>
            
          </div>

          <form className='py-1' onSubmit={formik.handleSubmit}>
            <div className="profile flex justify-center py-4">
              <label htmlFor="profile">
                <img src={apiData?.profile || file || avatar} alt="avatar" className={`${styles.profile_img} ${extend.profile_img}`} />
              </label>

              <input type="file" id='profile' name='profile' onChange={onUpload} />
              

            </div>
            <div className="textbox flex flex-col items-center gap-6">
              <div className="name flex w-3/4 gap-10">
                <input {...formik.getFieldProps('firstName')} type="text " placeholder='First Name' className={`${styles.textbox} ${extend.textbox}`} />
                <input {...formik.getFieldProps('lastName')} type="text " placeholder='Last Name' className={`${styles.textbox} ${extend.textbox}`} />
              </div>
              <div className="flex w-3/4 gap-10">
              <input {...formik.getFieldProps('mobile')} type="text" placeholder='Mobile No.' className={`${styles.textbox} ${extend.textbox}`} />
                <input {...formik.getFieldProps('email')} type="email " placeholder='Email*' className={`${styles.textbox} ${extend.textbox}`} />
                

              </div>
              
                <input {...formik.getFieldProps('address')} type="text " placeholder='Address' className={`${styles.textbox} ${extend.textbox}`} />
                <button type='submit' className={styles.btn}>Update</button>

            </div>
            <div className="text-center py-4">
              <span className='text-gray-500'>Come back Later? <button onClick={userLogout } className='text-red-500'>Logout</button></span>

            </div>

          </form>

        </div>
      </div>
    </div>
  )
}

export default Register


