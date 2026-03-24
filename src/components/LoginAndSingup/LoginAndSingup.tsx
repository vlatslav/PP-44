import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import './LoginAndSingup.scss';
import { app } from './../../firebase';
import React from 'react';
import user_icon from '../../assets/photos/person.png';
import email_icon from '../../assets/photos/email.png';
import password_icon from '../../assets/photos/password.png';
import { useAppDispatch } from '../../hooks/redux.ts';
import { setUser } from '../../store/redusers/user/user.store.ts';
import { login } from '../../store/redusers/auth/auth.store.ts';
import AlertMessage from '../AlertMessage/AlertMessage.js';
import { useNavigate } from 'react-router-dom';

const LoginAndSingup = () => {
  const auth = getAuth(app);
  const dispatch = useAppDispatch();
  const navigation = useNavigate();

  const [action, setAction] = useState('Login');
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [code, setCode] = useState<number | null>(null);

  const redirect = () => {
    navigation('/');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (action === 'Sign Up') {
        const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);
        const user = userCredential.user;
        await updateProfile(user, {
          displayName: name,
        });
        setMessage('Successfully signed up!');
        setCode(200);
        setAction('Login');
        setPassword('');
        setName('');
        setTimeout(redirect, 2000);
      } else if (action === 'Login') {
        const res = await signInWithEmailAndPassword(auth, userEmail, password);
        setMessage('Successfully logged in!');
        setCode(200);

        const user = res.user;
        const uid = user.uid;
        const email = user.email;
        const displayName = user.displayName || '';
        const idToken = await user.getIdToken();

        dispatch(setUser({ uid, email, name: displayName }));
        dispatch(login({ role: 'user', idToken }));
        localStorage.setItem('isLoggedIn', JSON.stringify(true));
        localStorage.setItem('uid', uid);
        localStorage.setItem('idToken', idToken);

        setTimeout(redirect, 2000);
      }
    } catch (err) {
      setMessage('Check email or password and try again!');
      setCode(400);
    }
  };

  const changeMethod = () => {
    if (action === 'Sign Up') {
      setAction('Login');
    } else {
      setAction('Sign Up');
    }
    setPassword('');
    setName('');
  };

  return (
      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>
        <form className="inputs" onSubmit={(e) => handleSubmit(e)}>
          {action === 'Sign Up' ? (
              <div className="input">
                <img src={user_icon} alt="" />
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
              </div>
          ) : (
              <></>
          )}
          <div className="input">
            <img src={email_icon} alt="" />
            <input
                type="email"
                value={userEmail}
                placeholder="Email"
                onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <div className="input">
            <img src={password_icon} alt="" />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="submit-container">
            <button className="submit">{action}</button>
          </div>
          <div className="change-method">
            {action === 'Sign Up' ? (
                <>
                  Have an account? <span onClick={changeMethod}>Login!</span>
                </>
            ) : (
                <>
                  Don't have an account? <span onClick={changeMethod}>Sign Up!</span>
                </>
            )}
          </div>
        </form>
        {message && (
            <AlertMessage
                code={code}
                message={message}
                setMessage={setMessage}
                duration={3000}
            />
        )}
      </div>
  );
};

export default LoginAndSingup;