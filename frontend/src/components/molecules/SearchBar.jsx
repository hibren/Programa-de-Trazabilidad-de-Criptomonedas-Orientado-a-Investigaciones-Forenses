import Input from "../atoms/Input"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"

const SearchBar = ({ placeholder = "Buscar...", onSearch, className = "" }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Input placeholder={placeholder} className="pl-10" />
        <Icon
          name="search"
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
        />
      </div>
      <Button variant="success" size="icon">
        <Icon name="search" size={18} />
      </Button>
    </div>
  )
}

export default SearchBar
