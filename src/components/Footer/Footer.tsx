import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
      <div className={styles.footer}>
        <div className={styles.inner}>
          <ul className={styles.list}>
            <li className={styles.item}>
              <span>Nestorko V. S.</span>
            </li>
            <li className={styles.item}>
              <span>IKNI, PP-34</span>
            </li>
            <li className={styles.item}>
              <Link to={"mailto:volodymyr.nestorko.pp.2022@lpnu.ua"}>volodymyr.nestorko.pp.2022@lpnu.ua</Link>
            </li>
          </ul>
          <p className={styles.copyright}>Copyright © 2025 Lviv Polytechnic National University | All Rights Reserved </p>
        </div>
      </div>
  );
};

export default Footer;