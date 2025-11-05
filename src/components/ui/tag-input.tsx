
"use client"

import React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

interface TagInputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ className, tags, onChange, suggestions = [], ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState("")
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      setIsPopoverOpen(true)
    }

    const addTag = (newTag: string) => {
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInputValue("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "Enter" || e.key === ",") && !isPopoverOpen) {
        e.preventDefault()
        const newTag = inputValue.trim()
        addTag(newTag)
      } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        removeTag(tags[tags.length - 1])
      }
    }

    const removeTag = (tagToRemove: string) => {
      onChange(tags.filter((tag: string) => tag !== tagToRemove))
    }

    const filteredSuggestions = suggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(suggestion)
    );
    
    const popoverShouldBeOpen = isPopoverOpen && filteredSuggestions.length > 0 && inputValue.length > 0;

    return (
      <Popover open={popoverShouldBeOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="flex flex-wrap gap-2 rounded-md border border-input p-2 items-center">
            {tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary">
                {tag}
                <button
                  type="button"
                  className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
             <input
              ref={ref}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={cn(
                "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
                className
              )}
              {...props}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandGroup>
              {filteredSuggestions.slice(0, 10).map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  onSelect={() => {
                    addTag(suggestion)
                    setIsPopoverOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

TagInput.displayName = "TagInput"

export { TagInput }
