
"use client"

import React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "./input"

interface TagInputProps extends Omit<React.ComponentPropsWithoutRef<typeof Input>, "onChange"> {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ className, tags, onChange, suggestions = [], ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [inputValue, setInputValue] = React.useState("")
    const [isFocused, setIsFocused] = React.useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
    }

    const addTag = (newTag: string) => {
      const trimmedTag = newTag.trim()
      if (trimmedTag && !tags.includes(trimmedTag)) {
        onChange([...tags, trimmedTag])
      }
      setInputValue("")
    }

    const removeTag = (tagToRemove: string) => {
      onChange(tags.filter((tag) => tag !== tagToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "Enter" || e.key === ",") && inputValue) {
        e.preventDefault()
        addTag(inputValue)
      } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        removeTag(tags[tags.length - 1])
      }
    }
    
    const filteredSuggestions = suggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(suggestion)
    );

    const showSuggestions = isFocused && inputValue && filteredSuggestions.length > 0;

    return (
      <Command
        className="relative"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (showSuggestions) {
              // Let cmdk handle it
            } else {
              handleKeyDown(e as any);
            }
          } else {
            handleKeyDown(e as any);
          }
        }}
      >
        <div
          className="group flex flex-wrap gap-2 rounded-md border border-input p-2 items-center text-sm"
          onClick={() => inputRef.current?.focus()}
        >
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
              <button
                type="button"
                className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={(e) => {
                  e.stopPropagation() // prevent focus on input
                  removeTag(tag)
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "bg-transparent outline-none placeholder:text-muted-foreground flex-1 min-w-[60px]",
              className
            )}
            {...props}
          />
        </div>
        
        {showSuggestions && (
          <div className="absolute top-[calc(100%+0.5rem)] left-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <CommandList>
              <CommandGroup>
                {filteredSuggestions.slice(0, 10).map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    onMouseDown={(e) => {
                      e.preventDefault()
                    }}
                    onSelect={() => {
                      addTag(suggestion)
                    }}
                    className="cursor-pointer"
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </Command>
    )
  }
)

TagInput.displayName = "TagInput"

export { TagInput }
