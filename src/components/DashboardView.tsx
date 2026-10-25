import React, { useState } from 'react';
import { UserRole } from '../types';
import { formatRupiah, formatCompactRupiah } from '../utils/audio';
import { IconReceipt, IconBox, IconAlert, IconTrendingUp, IconLock } from './Icons';

interface DashboardViewProps {
  userRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ userRole }) => {
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(3); // April as active

  // Sample lollipop monthly data (Jan - Jun)
  const monthlyData = [
    { month: 'Jan', revenue: 11200000 },
    { month: 'Feb', revenue: 14500000 },
    { month: 'Mar', revenue: 12800000 },
    { month: 'Apr', revenue: 17200000 }, // Active
    { month: 'Mei', revenue: 15900000 },
    { month: 'Jun', revenue: 18400000 },
  ];

  // Hourly transactions data (09:00 - 21:00)
  const hourlyData = [
    { hour: '09', count: 12 },
    { hour: '11', count: 28 },
    { hour: '13', count: 45 },
    { hour: '15', count: 68 },
    { hour: '17', count: 52 },
    { hour: '19', count: 85 }, // Peak
    { hour: '21', count: 34 },
  ];

  // Category sales range
  const categoryRanges = [
    { name: 'Mobil Remote', min: 28, max: 74, revenue: 6450000 },
    { name: 'Balok & Lego', min: 14, max: 56, revenue: 4890000 },
    { name: 'Boneka Fluffy', min: 22, max: 62, revenue: 3200000 },
    { name: 'Action Figure', min: 18, max: 48, revenue: 2650000 },
  ];

  const isOwner = userRole === 'pemilik';

  return (
    <div className="content-area">
      {/* KPI Cards Grid */}
      <div className={`kpi-grid ${isOwner ? 'five-cols' : ''}`}>
        {/* KPI 1: Transaksi Hari Ini */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon-pill">
              <IconReceipt size={16} />
            </span>
            <div className="delta-badge">
              <span className="delta-circle up">↑</span>
              <span>12% (30 hari)</span>
            </div>
          </div>
          <div>
            <div className="kpi-label">Transaksi Hari Ini</div>
            <div className="kpi-bottom">
              <div className="kpi-number tabular">142</div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>struk</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Item Terjual */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon-pill">
              <IconBox size={16} />
            </span>
            <div className="delta-badge">
              <span className="delta-circle up">↑</span>
              <span>8% (30 hari)</span>
            </div>
          </div>
          <div>
            <div className="kpi-label">Item Terjual</div>
            <div className="kpi-bottom">
              <div className="kpi-number tabular">389</div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>pcs</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Transaksi Void */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span
              className="kpi-icon-pill"
              style={{ backgroundColor: 'var(--danger)', color: '#ffffff' }}
            >
              <IconAlert size={15} color="#ffffff" />
            </span>
            <div className="delta-badge">
              <span className="delta-circle down">↓</span>
              <span>1% (30 hari)</span>
            </div>
          </div>
          <div>
            <div className="kpi-label">Transaksi Void</div>
            <div className="kpi-bottom">
              <div className="kpi-number tabular" style={{ color: 'var(--danger)' }}>
                2
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>dibatalkan</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Total Omzet */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon-pill">
              <IconTrendingUp size={16} />
            </span>
            <div className="delta-badge">
              <span className="delta-circle up">↑</span>
              <span>15%</span>
            </div>
          </div>
          <div>
            <div className="kpi-label">Pendapatan (Omzet)</div>
            <div className="kpi-bottom">
              <div className="kpi-number compact tabular">
                {formatCompactRupiah(14850000)}
              </div>
            </div>
          </div>
        </div>

        {/* KPI 5: Laba Bersih (Eksklusif Pemilik Toko) */}
        {isOwner && (
          <div
            className="card kpi-card"
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid rgba(80, 160, 124, 0.35)',
            }}
          >
            <div className="kpi-top">
              <span
                className="kpi-icon-pill"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--text-on-cream)' }}
              >
                <IconLock size={15} />
              </span>
              <span
                style={{
                  fontSize: 10,
                  backgroundColor: 'var(--accent-deep)',
                  color: 'var(--text-primary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600,
                }}
              >
                Khusus Pemilik
              </span>
            </div>
            <div>
              <div className="kpi-label" style={{ color: 'var(--accent)' }}>
                Laba Bersih Toko
              </div>
              <div className="kpi-bottom">
                <div
                  className="kpi-number compact tabular"
                  style={{ color: 'var(--accent)' }}
                >
                  {formatCompactRupiah(5240000)}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                HPP: Rp 9,6 jt | Margin 35,2%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Grafik 2x2 per design.md Section 7 */}
      <div className="charts-grid">
        {/* 1. Grafik Lollipop (Pendapatan Bulanan) */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Grafik Pendapatan Bulanan</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Realisasi penjualan semester berjalan tahun 2026
              </p>
            </div>
            <span className="chart-badge">Tahun 2026 ⌄</span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              padding: '20px 10px 10px',
              position: 'relative',
            }}
          >
            {/* Horizontal dotted baseline */}
            <div
              style={{
                position: 'absolute',
                left: 10,
                right: 10,
                bottom: 45,
                borderTop: '1px dashed var(--surface-raised)',
              }}
            />

            {monthlyData.map((item, idx) => {
              const maxRev = 20000000;
              const heightPercent = (item.revenue / maxRev) * 180;
              const isActive = activeMonthIdx === idx;

              return (
                <div
                  key={item.month}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                  onClick={() => setActiveMonthIdx(idx)}
                >
                  {/* Tooltip Pill per design.md: Hijau dengan teks hitam & ekor runcing */}
                  {isActive && (
                    <div
                      style={{
                        position: 'relative',
                        backgroundColor: 'var(--accent-strong)',
                        color: 'var(--text-on-cream)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 8,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        whiteSpace: 'nowrap',
                      }}
                      className="tabular"
                    >
                      {formatRupiah(item.revenue)}
                    </div>
                  )}

                  {/* Lollipop Circle */}
                  <div
                    style={{
                      width: isActive ? 18 : 12,
                      height: isActive ? 18 : 12,
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'var(--accent-strong)' : 'var(--accent)',
                      boxShadow: isActive ? '0 0 10px var(--accent)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />

                  {/* Lollipop Stem */}
                  <div
                    style={{
                      width: 2,
                      height: heightPercent,
                      backgroundColor: 'var(--accent)',
                      marginTop: -2,
                    }}
                  />

                  {/* Month Pill Label at base */}
                  <div
                    style={{
                      marginTop: 10,
                      backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-frame)',
                      color: 'var(--text-on-cream)',
                      borderRadius: 'var(--radius-pill)',
                      padding: '3px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Ring Gauge (3 Concentric Ring: Target Harian, Stok Aman, QRIS) */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Pencapaian Target & Operasional</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Target omzet harian, rasio ketersediaan stok, dan transaksi non-tunai
              </p>
            </div>
            <span className="chart-badge">Real-Time</span>
          </div>

          <div className="gauge-container">
            <svg width="220" height="220" viewBox="0 0 240 240" style={{ flexShrink: 0 }}>
              {/* Outer Ring 1: Target Omzet Harian (82%) */}
              <circle
                cx="120"
                cy="120"
                r="95"
                fill="none"
                stroke="var(--track)"
                strokeWidth="10"
              />
              <circle
                cx="120"
                cy="120"
                r="95"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="10"
                strokeDasharray="596"
                strokeDashoffset={596 * (1 - 0.82)}
                strokeLinecap="round"
                transform="rotate(-90 120 120)"
              />

              {/* Middle Ring 2: Stok Aman (94%) */}
              <circle
                cx="120"
                cy="120"
                r="78"
                fill="none"
                stroke="var(--track)"
                strokeWidth="8"
              />
              <circle
                cx="120"
                cy="120"
                r="78"
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth="8"
                strokeDasharray="490"
                strokeDashoffset={490 * (1 - 0.94)}
                strokeLinecap="round"
                transform="rotate(-90 120 120)"
              />

              {/* Inner Ring 3: Porsi Tunai vs QRIS (65%) */}
              <circle
                cx="120"
                cy="120"
                r="62"
                fill="none"
                stroke="var(--track)"
                strokeWidth="8"
              />
              <circle
                cx="120"
                cy="120"
                r="62"
                fill="none"
                stroke="var(--accent-deep)"
                strokeWidth="8"
                strokeDasharray="389"
                strokeDashoffset={389 * (1 - 0.65)}
                strokeLinecap="round"
                transform="rotate(-90 120 120)"
              />

              {/* Center Cream Disc with 44px text per design.md line 73 */}
              <circle cx="120" cy="120" r="46" fill="var(--bg-frame)" />
              <text
                x="120"
                y="126"
                textAnchor="middle"
                fill="#000000"
                fontSize="38"
                fontWeight="400"
                fontFamily="Inter, sans-serif"
              >
                82<tspan fontSize="20">%</tspan>
              </text>
            </svg>

            {/* Legend Labels */}
            <div className="gauge-legend">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>Target: 82%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-strong)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>Stok Aman: 94%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-deep)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>QRIS/Non-Tunai: 65%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Area Chart: Transaksi per Jam */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Aktivitas Transaksi per Jam</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Puncak jam belanja ramai (Peak Hour: 19:00 WIB)
              </p>
            </div>
            <span className="chart-badge">Hari Ini ⌄</span>
          </div>

          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '10px 10px 20px',
            }}
          >
            <svg
              viewBox="0 0 500 180"
              style={{ width: '100%', height: 160, overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <polygon
                points="0,170 30,150 100,120 180,80 260,110 350,30 430,90 500,140 500,180 0,180"
                fill="url(#areaGradient)"
              />

              {/* Monotone curve path */}
              <polyline
                points="0,170 30,150 100,120 180,80 260,110 350,30 430,90 500,140"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Guideline on peak hour */}
              <line
                x1="350"
                y1="30"
                x2="350"
                y2="180"
                stroke="var(--bg-frame)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Active point marker */}
              <circle
                cx="350"
                cy="30"
                r="6"
                fill="var(--accent-strong)"
                stroke="#000000"
                strokeWidth="2"
              />
            </svg>

            {/* Hours axis labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'var(--text-muted)',
                marginTop: 8,
              }}
            >
              {hourlyData.map((h, i) => (
                <span
                  key={h.hour}
                  style={{
                    color: i === 5 ? 'var(--accent)' : 'inherit',
                    fontWeight: i === 5 ? 700 : 400,
                  }}
                >
                  {h.hour}:00
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Batang Rentang (Range Bars per Kategori) */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Penjualan per Kategori</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Rentang penjualan dan total kontribusi omzet
              </p>
            </div>
            <span className="chart-badge">Pekan Ini</span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              padding: '10px 0',
            }}
          >
            {categoryRanges.map((cat) => (
              <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  <span className="tabular" style={{ color: 'var(--text-muted)' }}>
                    {formatRupiah(cat.revenue)} ({cat.max} terjual)
                  </span>
                </div>

                {/* Range Bar with full pill curve */}
                <div
                  style={{
                    height: 10,
                    backgroundColor: 'var(--surface-raised)',
                    borderRadius: 'var(--radius-pill)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${cat.min}%`,
                      width: `${cat.max - cat.min + 15}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent)',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
