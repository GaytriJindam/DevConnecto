import axios from 'axios';
import { setAlert } from './alert';

import {
    ACCOUNT_DELETED,
    CLEAR_PROFILE,
    GET_PROFILE,
    GET_PROFILES,
    GET_REPOS,
    PROFILE_ERROR,
    UPDATE_PROFILE
} from './types';
import { header } from 'express-validator';


// get current users profile
export const getCurrentProfile = () =>
    async dispatch => {
    
try {
    const res = await axios.get('/api/profile/me');

    dispatch({
        type: GET_PROFILE,
        payload: res.data
    });
} catch (error) {
    dispatch({
        type: PROFILE_ERROR,
        payload: { msg: error.response.statusText, status: error.response.status}
    });
    }
    };

// get all profiles
export const getProfiles = () =>
    async dispatch => {
        dispatch({ type: CLEAR_PROFILE});
    
try {
    const res = await axios.get('/api/profile');

    dispatch({
        type: GET_PROFILES,
        payload: res.data
    });
} catch (error) {
    dispatch({
        type: PROFILE_ERROR,
        payload: { msg: error.response.statusText, status: error.response.status}
    });
    }
    };

    // get  profile by id
export const getProfileByID = userId =>
    async dispatch => {
    
try {
    const res = await axios.get(`/api/profile/user/${userId}`);
    const profileData = Array.isArray(res.data) ? res.data[0] : res.data;

    dispatch({
        type: GET_PROFILE,
        payload: profileData
    });
} catch (error) {
    dispatch({
        type: PROFILE_ERROR,
        payload: { msg: error.response.statusText, status: error.response.status}
    });
    }
    };

// get Github repos
export const getGithubRepos = username =>
    async dispatch => {
    
try {
    const res = await axios.get(`/api/profile/github/${username}`);

    dispatch({
        type: GET_REPOS,
        payload: res.data
    });
} catch (error) {
    dispatch({
        type: PROFILE_ERROR,
        payload: { msg: error.response.statusText, status: error.response.status}
    });
    }
    };

// Create or update profile
export const createProfile = (formData, navigate, edit = false) =>
    async dispatch => {
    
try {
    const config ={
        headers : {
            'Content-Type' : 'application/json'
        }
    }
    const res = await axios.post('/api/profile',formData,config);

    dispatch({
        type: GET_PROFILE,
        payload: res.data
    });
    console.log(" edit" , edit);
    dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));
    if(!edit)
    {
        navigate('/dashboard');
    }

} catch (error) {
    const errors = error.response.data.errors;

    if(errors)
    {
        errors.forEach((error) => {
            dispatch(setAlert(error.msg, 'danger'));
        });
    }

    dispatch({
        type: PROFILE_ERROR,
        payload: { msg: error.response.statusText, status: error.response.status}
    });
    }
    };

export const addExperience = ( formData, navigate) =>
    async dispatch =>
    {
        try {
            const config ={
                headers : {
                    'Content-Type' : 'application/json'
                }
            }
            console.log(" addExperience");
            const res = await axios.put('/api/profile/experience',formData,config);
            console.log(" addExperience",res);

            dispatch({
                type: UPDATE_PROFILE,
                payload: res.data
            });
            dispatch(setAlert('Experience Added ','success'));
            
                navigate('/dashboard');
        
        } catch (error) {
            const errors = error.response?.data?.errors;
            if (errors) {
                errors.forEach((err) => dispatch(setAlert(err.msg, 'danger')));
            }
    
            dispatch({
                type: PROFILE_ERROR,
                payload: {
                    msg: error.response?.statusText || 'Server Error',
                    status: error.response?.status || 500
                }
            });
                }
        
    };

    export const addEducation = ( formData, navigate) =>
        async dispatch =>
        {
            try {
                const config ={
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                }
                const res = await axios.put('/api/profile/education',formData,config);
            
                dispatch({
                    type: UPDATE_PROFILE,
                    payload: res.data
                });
                dispatch(setAlert('Education Added ','success'));
                
                    navigate('/dashboard');
            
            } catch (error) {
                const errors = error.response?.data?.errors;
                if (errors) {
                    errors.forEach((err) => dispatch(setAlert(err.msg, 'danger')));
                }
        
                dispatch({
                    type: PROFILE_ERROR,
                    payload: {
                        msg: error.response?.statusText || 'Server Error',
                        status: error.response?.status || 500
                    }
                });
                        }
            
        };

// Delete experience
export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/experience/${id}`);

        dispatch ({
            type:UPDATE_PROFILE,
            payload: res.data
        });
        dispatch(setAlert('Experience removed ','success'));

    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        });
        
    }
};

// Delete education
export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/education/${id}`);

        dispatch ({
            type:UPDATE_PROFILE,
            payload: res.data
        });
        dispatch(setAlert('Education removed ','success'));

    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        });
        
    }
};
// Delete account & profile
export const deleteAccount = () => async dispatch => {
    if(window.confirm('Are you sure? This can NOT be undone!'))
    {
        try {
             await axios.delete(`/api/profile`);
    
            dispatch ({type:CLEAR_PROFILE});
            dispatch ({type:ACCOUNT_DELETED});

            dispatch(setAlert('Your account has been permanantly deleted ','danger'));
    
        } catch (error) {
            dispatch({
                type: PROFILE_ERROR,
                payload: { msg: error.response.statusText, status: error.response.status}
            });
            
        }
    
    }
};
