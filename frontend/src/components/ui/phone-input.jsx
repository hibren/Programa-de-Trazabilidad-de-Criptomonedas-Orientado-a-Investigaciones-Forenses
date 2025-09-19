import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
const PhoneInput = React.forwardRef(
  ({ className, onChange, ...props }, ref) => {
    return (
      <RPNInput.default
        ref={ref}
        className={cn("flex ", className)}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
        onChange={(value) => onChange?.(value || "")}
        {...props}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"
const InputComponent = React.forwardRef(({ className, ...props }, ref) => (
  <input
    className={cn(
      "bg-background outline-none border  rounded-sm w-full   ",
      className
    )}
    {...props}
    ref={ref}
  />
))
InputComponent.displayName = "InputComponent"
const CountrySelect = ({ disabled, value, onChange, options }) => {
  const handleSelect = React.useCallback(
    (country) => {
      onChange(country)
    },
    [onChange]
  )
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn("flex gap-1 border w-auto p-0 px-1  ")}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown
            className={cn(
              "-mr- h-3  w-3   opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandList>
            <ScrollArea className="h-72">
              <CommandInput className="h-8" placeholder="Buscar país..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((x) => x.value)
                  .map((option) => (
                    <CommandItem
                      className="gap-2"
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <FlagComponent
                        country={option.value}
                        countryName={option.label}
                      />
                      <span className="flex-1 text-sm">{option.label}</span>
                      {option.value && (
                        <span className="text-sm text-foreground">
                          {`+${RPNInput.getCountryCallingCode(option.value)}`}
                        </span>
                      )}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-3 w-full border ",
                          option.value === value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
const FlagComponent = ({ country, countryName }) => {
  const Flag = flags[country]
  return (
    <span className="flex  overflow-hidden rounded-sm bg-foreground/20">
      {Flag && <Flag title={countryName} />}
    </span>
  )
}
FlagComponent.displayName = "FlagComponent"
export { PhoneInput }

