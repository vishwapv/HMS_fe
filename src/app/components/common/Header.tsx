"use client";

import { useState } from 'react';
import Image from 'next/image';
import { MenuItem } from '../../../../types';
import HamburgerMenu from './HamburgerMenu';
import styles from '../../styles/components/Header.module.css';
import hospitalLogo from '../../icons/WhatsApp Image 2025-08-30 at 10.16.31 PM.jpeg';

interface HeaderProps {
  menuItems?: MenuItem[];
}

const Header: React.FC<HeaderProps> = ({ menuItems = [] }) => {
  const [activePage, setActivePage] = useState<string>('');
  const handleMenuItemClick = (href: string) => {
    setActivePage(href);
    console.log('Menu item clicked:', href);
    // Add navigation logic here
  };


  return (
    <div className={styles.header}>
      {/* Hamburger button */}
      <div className={styles.hamburgerWrapper}>
        <HamburgerMenu menuItems={menuItems} onMenuItemClick={handleMenuItemClick} />
      </div>

      {/* Centered Logo & Title */}
      <div className={styles.logoContainer}>
        <div className={styles.logoTitle}>
          <h1 className={styles.title}>Swasthya Multi Speciality Hospital</h1>
          <Image
            src={hospitalLogo}
            alt="Hospital logo"
            width={90}
            height={90}
            className={styles.logo}
            priority
          />
        </div>

        {/* Logout button at right */}
        <button className={styles.logout}>Logout</button>
      </div>
    </div>
  );
};

export default Header;
