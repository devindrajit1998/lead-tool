import React from 'react';
import { Users, PhoneCall, Clock, PhoneMissed, Award } from 'lucide-react';

export const StatsBar = ({ leads = [], activeStatusFilter, onSelectStatusFilter }) => {
  const total = leads.length;
  const contacted = leads.filter((l) => l.status === 'Contacted').length;
  const followUp = leads.filter((l) => l.status === 'Follow Up').length;
  const notAnswered = leads.filter((l) => l.status === 'Not Answered').length;
  const closedWon = leads.filter((l) => l.status === 'Closed Won').length;

  const stats = [
    {
      id: 'all',
      label: 'Total Leads',
      count: total,
      icon: Users,
      colorClass: 'stat-total',
      filterValue: 'all',
    },
    {
      id: 'Contacted',
      label: 'Contacted',
      count: contacted,
      icon: PhoneCall,
      colorClass: 'stat-contacted',
      filterValue: 'Contacted',
    },
    {
      id: 'Follow Up',
      label: 'Follow Up',
      count: followUp,
      icon: Clock,
      colorClass: 'stat-followup',
      filterValue: 'Follow Up',
    },
    {
      id: 'Not Answered',
      label: 'Not Answered',
      count: notAnswered,
      icon: PhoneMissed,
      colorClass: 'stat-notanswered',
      filterValue: 'Not Answered',
    },
    {
      id: 'Closed Won',
      label: 'Closed Won',
      count: closedWon,
      icon: Award,
      colorClass: 'stat-closedwon',
      filterValue: 'Closed Won',
    },
  ];

  return (
    <div className="stats-scroll-wrapper">
      <div className="stats-bar">
        {stats.map((item) => {
          const Icon = item.icon;
          const isActive = activeStatusFilter === item.filterValue;

          return (
            <button
              key={item.id}
              className={`stat-card ${item.colorClass} ${isActive ? 'active-filter' : ''}`}
              onClick={() => onSelectStatusFilter(item.filterValue)}
              title={`Filter by ${item.label}`}
            >
              <div className="stat-icon-wrapper">
                <Icon size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-count">{item.count}</span>
                <span className="stat-label">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
