import styles from './Header.module.scss';
import {Link} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from "../../hooks/redux.js";
import {clearUser} from "../../store/redusers/user/user.store.js";
import {logout} from "../../store/redusers/auth/auth.store.js";
import favorite from "../../../public/favorite.svg"

export default function Header() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(state => state.authReducer.isAuthenticated)
  const handleLogout = () => {
    dispatch(clearUser());
    dispatch(logout())
  }

  return (
      <>
        <header
            className={styles.header}
            id="main-header"
        >
          <div className={styles.container}>
            <div className={styles.left}>
              <Link to={'/favourites'} target={'_blank'} rel="noopener noreferrer">
                {isAuthenticated && <img className={styles.img} src={favorite}/>}
              </Link>
            </div>
            <Link className={styles.logo} to={'/'}>
              <span className={styles.title}>MovieMosaic</span>
            </Link>
            <div className={styles.right}>
              {isAuthenticated ?
                  <div onClick={() => handleLogout()} className={styles.link}>Logout</div>
                  :
                  <Link className={styles.link} to={'/authentication'}>Login</Link>
              }
            </div>
          </div>
        </header>
      </>
  );
}