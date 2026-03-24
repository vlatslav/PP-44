import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
      <div className={styles.footer}>
        <div className={styles.inner}>
          <ul className={styles.list}>
            <li className={styles.item}>
              <span>Melnyk S. M.</span>
            </li>
            <li className={styles.item}>
              <span>IKNI, PP-32</span>
            </li>
            <li className={styles.item}>
              <Link to={"mailto:sviatoslav.melnyk.pp.2022@lpnu.ua"}>sviatoslav.melnyk.pp.2022@lpnu.ua</Link>
            </li>
          </ul>
          <p className={styles.copyright}>Copyright © 2025 Lviv Polytechnic National University | All Rights Reserved </p>
        </div>
      </div>
  );
};

export default Footer;