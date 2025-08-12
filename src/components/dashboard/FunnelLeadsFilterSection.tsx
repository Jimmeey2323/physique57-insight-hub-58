
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Filter, X, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LeadsFilterOptions } from '@/types/leads';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

interface FunnelLeadsFilterSectionProps {
  filters: LeadsFilterOptions;
  onFiltersChange: (filters: LeadsFilterOptions) => void;
  uniqueValues: {
    locations: string[];
    sources: string[];
    stages: string[];
    statuses: string[];
    associates: string[];
    channels: string[];
    trialStatuses: string[];
    conversionStatuses: string[];
    retentionStatuses: string[];
  };
}

export const FunnelLeadsFilterSection: React.FC<FunnelLeadsFilterSectionProps> = ({
  filters,
  onFiltersChange,
  uniqueValues
}) => {
  const handleDateRangeChange = (field: 'start' | 'end', date: Date | undefined) => {
    if (date) {
      onFiltersChange({
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [field]: date.toISOString().split('T')[0]
        }
      });
    }
  };

  const handleArrayFilterChange = (field: keyof LeadsFilterOptions, value: string) => {
    const currentValues = filters[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [field]: newValues
    });
  };

  const handleLTVChange = (field: 'minLTV' | 'maxLTV', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onFiltersChange({
      ...filters,
      [field]: numValue
    });
  };

  const clearFilters = () => {
    const previousMonth = getPreviousMonthDateRange();
    onFiltersChange({
      dateRange: previousMonth,
      location: [],
      source: [],
      stage: [],
      status: [],
      associate: [],
      channel: [],
      trialStatus: [],
      conversionStatus: [],
      retentionStatus: [],
      minLTV: undefined,
      maxLTV: undefined
    });
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'dateRange') return count;
      if (Array.isArray(value)) return count + value.length;
      if (value !== undefined && value !== '') return count + 1;
      return count;
    }, 0);
  };

  const activeFilters = getActiveFilterCount();

  return (
    <div className="space-y-6">
      {/* Location Selector */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <Label className="text-sm font-semibold text-blue-800">Location Filter</Label>
        </div>
        <Select
          value={filters.location[0] || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              onFiltersChange({ ...filters, location: [] });
            } else {
              onFiltersChange({ ...filters, location: [value] });
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {uniqueValues.locations.map(location => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange.start && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.start ? format(new Date(filters.dateRange.start), "PPP") : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.start ? new Date(filters.dateRange.start) : undefined}
                onSelect={(date) => handleDateRangeChange('start', date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange.end && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.end ? format(new Date(filters.dateRange.end), "PPP") : "Pick end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.end ? new Date(filters.dateRange.end) : undefined}
                onSelect={(date) => handleDateRangeChange('end', date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Multi-select Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: 'source', label: 'Sources', values: uniqueValues.sources },
          { key: 'stage', label: 'Stages', values: uniqueValues.stages },
          { key: 'status', label: 'Status', values: uniqueValues.statuses },
          { key: 'associate', label: 'Associates', values: uniqueValues.associates },
          { key: 'channel', label: 'Channels', values: uniqueValues.channels },
          { key: 'trialStatus', label: 'Trial Status', values: uniqueValues.trialStatuses },
          { key: 'conversionStatus', label: 'Conversion Status', values: uniqueValues.conversionStatuses },
          { key: 'retentionStatus', label: 'Retention Status', values: uniqueValues.retentionStatuses }
        ].map(({ key, label, values }) => (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">{label}</Label>
            <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2 bg-slate-50">
              {values.map(value => (
                <label key={value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters[key as keyof LeadsFilterOptions] as string[]).includes(value)}
                    onChange={() => handleArrayFilterChange(key as keyof LeadsFilterOptions, value)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-slate-700">{value}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* LTV Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Min LTV (₹)</Label>
          <Input
            type="number"
            placeholder="Minimum LTV"
            value={filters.minLTV || ''}
            onChange={(e) => handleLTVChange('minLTV', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Max LTV (₹)</Label>
          <Input
            type="number"
            placeholder="Maximum LTV"
            value={filters.maxLTV || ''}
            onChange={(e) => handleLTVChange('maxLTV', e.target.value)}
          />
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Active Filters:</span>
          <Badge variant={activeFilters > 0 ? "default" : "outline"}>
            {activeFilters}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Clear All
        </Button>
      </div>
    </div>
  );
};
