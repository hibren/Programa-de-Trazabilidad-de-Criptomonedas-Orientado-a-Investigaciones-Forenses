import React from 'react'
import StatCard from '../molecules/StatCard'

export default function StatsGrid({ 
  stats, 
  columns = 3, 
  className = '' 
}) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid gap-6 ${gridClasses[columns]} ${className}`}>
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  )
}