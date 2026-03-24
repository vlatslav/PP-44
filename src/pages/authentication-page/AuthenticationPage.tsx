import {useEffect} from 'react';
import "./index.scss";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth.ts";
import LoginAndSingup from "../../components/LoginAndSingup/LoginAndSingup.js";

const AuthenticationPage = () => {

  const navigation = useNavigate()
  const {isAuthenticated} = useAuth()

  // const redirect = () => {
  //   navigation("/")
  // }
  //
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     setTimeout(redirect, 2000)
  //   }
  // }, [isAuthenticated]);

  return (
      <div className="page-background">
        <div className="authentication-container">
          <LoginAndSingup/>
        </div>
      </div>
  );
};

export default AuthenticationPage;