"use client";

import React from 'react';
import { hospitalData, kpiCards } from '../utils/dashboardhospitalData';
import styles from '../styles/pages/Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { dashboard, patientManagement, financialOperations, monthLabels } = hospitalData;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.pageTitle}>Hospital Finance Dashboard</h1>
        <p className={styles.pageSubtitle}>Comprehensive overview of hospital operations and financial performance</p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpiCards.map((kpi, index) => (
          <div key={index} className={styles.kpiCard}>
            <div className={styles.kpiIcon}>
              <span className={styles.iconEmoji}>{kpi.icon}</span>
            </div>
            <div className={styles.kpiContent}>
              <h3 className={styles.kpiTitle}>{kpi.title}</h3>
              <div className={styles.kpiValue}>{kpi.value}</div>
              <div className={styles.kpiChange}>{kpi.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        
        {/* Patient Admissions Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Monthly Patient Admissions</h3>
            <span className={styles.chartSubtitle}>vs Discharges</span>
          </div>
          <div className={styles.barChart}>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.admissionsColor}`}></span>
                Admissions
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.dischargesColor}`}></span>
                Discharges
              </div>
            </div>
            <div className={styles.barsContainer}>
              {monthLabels.map((month, index) => (
                <div key={month} className={styles.barGroup}>
                  <div className={styles.barPair}>
                    <div 
                      className={`${styles.bar} ${styles.admissionsBar}`}
                      style={{ height: `${(patientManagement.monthlyAdmissions[index] / 200) * 100}%` }}
                    ></div>
                    <div 
                      className={`${styles.bar} ${styles.dischargesBar}`}
                      style={{ height: `${(patientManagement.discharges[index] / 200) * 100}%` }}
                    ></div>
                  </div>
                  <span className={styles.barLabel}>{month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Pie Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Revenue by Source</h3>
            <span className={styles.chartSubtitle}>Current month breakdown</span>
          </div>
          <div className={styles.pieChart}>
            <div className={styles.pieContainer}>
              {financialOperations.revenueBySource.map((source, index) => {
                const angle = (source.percentage / 100) * 360;
                const prevAngles = financialOperations.revenueBySource.slice(0, index).reduce((sum, s) => sum + (s.percentage / 100) * 360, 0);
                
                return (
                  <div
                    key={source.source}
                    className={styles.pieSlice}
                    style={{
                      background: `conic-gradient(${source.color} 0deg ${angle}deg, transparent ${angle}deg 360deg)`,
                      transform: `rotate(${prevAngles}deg)`
                    }}
                  ></div>
                );
              })}
            </div>
            <div className={styles.pieLabels}>
              {financialOperations.revenueBySource.map((source) => (
                <div key={source.source} className={styles.pieLabelItem}>
                  <span className={styles.pieColorDot} style={{ backgroundColor: source.color }}></span>
                  <span className={styles.pieLabelText}>{source.source}</span>
                  <span className={styles.pieLabelPercent}>{source.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Trends Line Chart */}
        <div className={`${styles.chartCard} ${styles.wideCard}`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Financial Trends</h3>
            <span className={styles.chartSubtitle}>Monthly billing, claims, and payments</span>
          </div>
          <div className={styles.lineChart}>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.billingColor}`}></span>
                Billing
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.claimsColor}`}></span>
                Insurance Claims
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.paymentsColor}`}></span>
                Payments
              </div>
            </div>
            <div className={styles.lineContainer}>
              <svg className={styles.lineSvg} viewBox="0 0 400 200">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="0" y1={40 * i} x2="400" y2={40 * i} stroke="#e5e7eb" strokeWidth="1"/>
                ))}
                
                {/* Billing line */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points={financialOperations.monthlyBilling.map((value, index) => 
                    `${(index / 11) * 380 + 10},${200 - (value / 70000) * 180}`
                  ).join(' ')}
                />
                
                {/* Claims line */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  points={financialOperations.insuranceClaims.map((value, index) => 
                    `${(index / 11) * 380 + 10},${200 - (value / 70000) * 180}`
                  ).join(' ')}
                />
                
                {/* Payments line */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  points={financialOperations.paymentsProcessed.map((value, index) => 
                    `${(index / 11) * 380 + 10},${200 - (value / 70000) * 180}`
                  ).join(' ')}
                />
              </svg>
              <div className={styles.lineLabels}>
                {monthLabels.map((month) => (
                  <span key={month} className={styles.lineLabel}>{month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Patients by Department</h3>
            <span className={styles.chartSubtitle}>Current distribution</span>
          </div>
          <div className={styles.departmentChart}>
            {patientManagement.patientsByDepartment.map((dept) => (
              <div key={dept.department} className={styles.departmentItem}>
                <div className={styles.departmentInfo}>
                  <span className={styles.departmentName}>{dept.department}</span>
                  <span className={styles.departmentCount}>{dept.count}</span>
                </div>
                <div className={styles.departmentBar}>
                  <div 
                    className={styles.departmentBarFill}
                    style={{ 
                      width: `${(dept.count / 180) * 100}%`,
                      backgroundColor: dept.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
