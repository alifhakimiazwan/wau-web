'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

interface DateRangeSelectorProps {
  onRangeChange: (startDate: Date, endDate: Date) => void
  defaultRange?: 'last7days' | 'last14days'
}

export function DateRangeSelector({
  onRangeChange,
  defaultRange = 'last14days',
}: DateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(defaultRange)
  const [customRange, setCustomRange] = useState<DateRange | undefined>()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handlePresetClick = (preset: 'last7days' | 'last14days') => {
    setSelectedPreset(preset)
    setCustomRange(undefined)

    const endDate = new Date()
    const startDate = new Date()

    if (preset === 'last7days') {
      startDate.setDate(endDate.getDate() - 6)
    } else {
      startDate.setDate(endDate.getDate() - 13)
    }

    onRangeChange(startDate, endDate)
  }

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    setCustomRange(range)

    if (range?.from && range?.to) {
      const daysDiff = Math.floor(
        (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff > 90) {
        toast.error('Please select a date range of 90 days or less')
        return
      }

      setSelectedPreset('custom')
      onRangeChange(range.from, range.to)
      setIsPopoverOpen(false)
    }
  }

  const getCustomRangeLabel = () => {
    if (customRange?.from && customRange?.to) {
      return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`
    }
    return 'Custom Range'
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        variant={selectedPreset === 'last7days' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePresetClick('last7days')}
        className="whitespace-nowrap"
      >
        Last 7 days
      </Button>

      <Button
        variant={selectedPreset === 'last14days' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePresetClick('last14days')}
        className="whitespace-nowrap"
      >
        Last 14 days
      </Button>

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={selectedPreset === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn('justify-start text-left font-normal whitespace-nowrap')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getCustomRangeLabel()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={customRange}
            onSelect={handleCustomRangeSelect}
            numberOfMonths={1}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
