import Icon from "../atoms/Icon"

const StatCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-medium text-gray-600">{title}</h3>
        <Icon name={icon} size={20} className="text-gray-400 sm:w-6 sm:h-6" />
      </div>

      {/* Content */}
      <div className="space-y-1 sm:space-y-2">
        <p className="text-lg sm:text-2xl font-bold text-gray-900 break-words">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
        )}
        {trend && (
          <p
            className={`text-xs sm:text-sm ${
              trend.positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}

export default StatCard

