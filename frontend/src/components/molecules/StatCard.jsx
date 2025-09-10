import Icon from "../atoms/Icon"

const StatCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <Icon name={icon} size={24} className="text-gray-400" />
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {trend && <p className={`text-sm ${trend.positive ? "text-green-600" : "text-red-600"}`}>{trend.value}</p>}
      </div>
    </div>
  )
}

export default StatCard
