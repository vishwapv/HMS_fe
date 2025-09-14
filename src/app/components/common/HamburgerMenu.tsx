"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../../styles/components/HamburgerMenu.module.css';
import { HamburgerMenuProps } from '../../../../types';

const menuIcon = require("../../icons/generated-image.png");
const closeIcon = require("../../icons/closeIcon.png")

// Hospital Finance Menu Items (keeping the same)
const hospitalMenuItems = [
    {
        category: "Dashboard",
        items: [
            { href: "/", label: "Main Dashboard", icon: "📊" },
            { href: "/analytics", label: "Financial Analytics", icon: "📈" },
            { href: "/reports", label: "Executive Reports", icon: "📋" }
        ]
    },
    {
        category: "Patient Management",
        items: [
            { href: "/patients", label: "Patient Records", icon: "👥" },
            { href: "/admissions", label: "Admissions", icon: "🏥" },
            { href: "/discharges", label: "Discharges", icon: "🚪" },
            { href: "/appointments", label: "Appointments", icon: "📅" }
        ]
    },
    {
        category: "Financial Operations",
        items: [
            { href: "/billing", label: "Patient Billing", icon: "💰" },
            { href: "/insurance", label: "Insurance Claims", icon: "🛡️" },
            { href: "/payments", label: "Payment Processing", icon: "💳" },
            { href: "/accounts-receivable", label: "Accounts Receivable", icon: "📊" }
        ]
    }
];

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
    menuItems = [],
    onMenuItemClick,
}) => {

    const [isOpen, setIsOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);


    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);
    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c != category)
                : [...prev, category]
        )
    }

    const handleMenuItemClick = (href: string) => {
        closeMenu();
        if (onMenuItemClick) onMenuItemClick(href);
        console.log(`Navigating to: ${href}`);
    };





    return (
        <>
            <div
                className={`${styles.hamburgerButton} ${isOpen ? styles.hamburgerOpen : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
            >
                {!isOpen ? (
                    <Image
                        src={menuIcon}
                        alt="Menu"
                        width={20}
                        height={20}
                        className={styles.menuIcon}
                    />
                ) : (
                    <Image
                        src={closeIcon}
                        alt="Menu"
                        width={20}
                        height={20}
                        className={styles.menuIcon}
                    />
                )

                }
            </div>

            {isOpen && (
                <div className={styles.menuContainer}>
                    <div className={styles.menuHeader}>
                        <h3 className={styles.menuTitle}>Hospital Finance System</h3>
                    </div>
                    <div className={styles.menuContent}>
                        {
                            hospitalMenuItems.map((section, sectionIdx) => (
                                <div key={sectionIdx} className={styles.menuSection}>
                                    <button
                                        className={styles.categoryButton}
                                        onClick={() => toggleCategory(section.category)}
                                    >
                                        <span className={styles.categoryName}>{section.category}</span>
                                        <span
                                            className={`${styles.categoryArrow} ${expandedCategories.includes(section.category) ? styles.arrowRotated : ''
                                                }`}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </span>

                                    </button>
                                    {expandedCategories.includes(section.category) && (
                                        <div className={styles.categoryItems}>
                                            {section.items.map((item, itemIdx) => (
                                                <a
                                                    key={itemIdx}
                                                    href={item.href}
                                                    className={styles.menuItem}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleMenuItemClick(item.href);
                                                    }}
                                                >
                                                    <span className={styles.itemIcon}>{item.icon}</span>
                                                    <span className={styles.itemLabel}>{item.label}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>

                </div>
            )}

        </>
    )
};

export default HamburgerMenu;
