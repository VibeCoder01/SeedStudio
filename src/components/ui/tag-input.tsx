"use client"

import React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TagInputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  tags: string[]
  onChange: (tags: string[]) => void
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ className, tags, onChange, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState("")

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault()
        const newTag = inputValue.trim()
        if (newTag && !tags.includes(newTag)) {
          onChange([...tags, newTag])
        }
        setInputValue("")
      }
    }

    const removeTag = (tagToRemove: string) => {
      onChange(tags.filter((tag: string) => tag !== tagToRemove))
    }

    return (
      <div>
        <div className="flex flex-wrap gap-2 rounded-md border border-input p-2">
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
      </div>
    )
  }
)

TagInput.displayName = "TagInput"

export { TagInput }
