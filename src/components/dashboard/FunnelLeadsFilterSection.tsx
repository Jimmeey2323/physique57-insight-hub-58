import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CalendarIcon, 
  Filter, 
  X, 
  ChevronDown, 
  Search,
  MapPin,
  Globe,
  Users,
  Activity,
  Briefcase,
  CreditCard,
  UserCheck,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const filterConfigs = [
    {
      key: 'location',
      label: 'Location',
      icon: MapPin,
      options: uniqueValues.locations,
      values: filters.location,
      description: 'Filter by lead location'
    },
    {
      key: 'source',
      label: 'Source',
      icon: Globe,
      options: uniqueValues.sources,
      values: filters.source,
      description: 'Filter by lead source'
    },
    {
      key: 'stage',
      label: 'Stage',
      icon: Activity,
      options: uniqueValues.stages,
      values: filters.stage,
      description: 'Filter by lead stage'
    },
    {
      key: 'status',
      label: 'Status',
      icon: UserCheck,
      options: uniqueValues.statuses,
      values: filters.status,
      description: 'Filter by lead status'
    },
    {
      key: 'associate',
      label: 'Associate',
      icon: Users,
      options: uniqueValues.associates,
      values: filters.associate,
      description: 'Filter by associate'
    },
    {
      key: 'channel',
      label: 'Channel',
      icon: Briefcase,
      options: uniqueValues.channels,
      values: filters.channel,
      description: 'Filter by channel'
    },
    {
      key: 'trialStatus',
      label: 'Trial Status',
      icon: Clock,
      options: uniqueValues.trialStatuses,
      values: filters.trialStatus,
      description: 'Filter by trial status'
    },
    {
      key: 'conversionStatus',
      label: 'Conversion Status',
      icon: CheckCircle,
      options: uniqueValues.conversionStatuses,
      values: filters.conversionStatus,
      description: 'Filter by conversion status'
    },
    {
      key: 'retentionStatus',
      label: 'Retention Status',
      icon: TrendingUp,
      options: uniqueValues.retentionStatuses,
      values: filters.retentionStatus,
      description: 'Filter by retention status'
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    const currentValues = [...(filters[filterKey as keyof LeadsFilterOptions] as string[])];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    onFiltersChange({ 
      ...filters, 
      [filterKey]: currentValues 
    });
  };

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date ? date.toISOString().split('T')[0] : null
      }
    });
  };

  const handleLTVChange = (type: 'minLTV' | 'maxLTV', value: number | undefined) => {
    onFiltersChange({
      ...filters,
      [type]: value
    });
  };

  const clearFilter = (filterKey: string) => {
    onFiltersChange({
      ...filters,
      [filterKey]: []
    });
  };

  const clearAllFilters = () => {
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

  const activeFilterCount = filterConfigs.reduce((count, config) => {
    return count + config.values.length;
  }, 0) + (filters.dateRange.start ? 1 : 0) + (filters.dateRange.end ? 1 : 0) + (filters.minLTV !== undefined ? 1 : 0) + (filters.maxLTV !== undefined ? 1 : 0);

  const MultiSelectFilter = ({ config }: { config: typeof filterConfigs[0] }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <config.icon className="w-4 h-4 text-gray-600" />
          <label className="font-medium text-sm text-gray-700">{config.label}</label>
          {config.values.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {config.values.length}
            </Badge>
          )}
        </div>
        {config.values.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilter(config.key)}
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </Button>
        )}
      </div>
      
      <Popover 
        open={openPopover === config.key} 
        onOpenChange={(open) => setOpenPopover(open ? config.key : null)}
      >
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between text-left font-normal"
            size="sm"
          >
            <span className="truncate">
              {config.values.length > 0 
                ? `${config.values.length} selected`
                : `Select ${config.label.toLowerCase()}`
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${config.label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No {config.label.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {config.options.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => handleFilterChange(config.key, option)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        config.values.includes(option)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Search className="h-3 w-3" />
                      </div>
                      <span>{option}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {config.values.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {config.values.slice(0, 3).map((value) => (
            <Badge 
              key={value} 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-red-100"
              onClick={() => handleFilterChange(config.key, value)}
            >
              {value}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {config.values.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{config.values.length - 3} more
            </Badge>
          )}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-1">{config.description}</p>
    </div>
  );

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Lead Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Badge className="bg-blue-600 text-white">
                {activeFilterCount} Active
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFilters}
              disabled={activeFilterCount === 0}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="filters" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="filters">Filter Options</TabsTrigger>
            <TabsTrigger value="dateRange">Date Range</TabsTrigger>
            <TabsTrigger value="ltvRange">LTV Range</TabsTrigger>
          </TabsList>
          
          <TabsContent value="filters" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterConfigs.map((config) => (
                <MultiSelectFilter key={config.key} config={config} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="dateRange" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-sm text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Start Date
                  </label>
                  {filters.dateRange.start && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateRangeChange('start', null)}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.start 
                        ? format(new Date(filters.dateRange.start), 'PPP')
                        : 'Select start date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.start ? new Date(filters.dateRange.start) : undefined}
                      onSelect={(date) => handleDateRangeChange('start', date)}
                      disabled={(date) => 
                        filters.dateRange.end 
                          ? date > new Date(filters.dateRange.end)
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-sm text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    End Date
                  </label>
                  {filters.dateRange.end && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateRangeChange('end', null)}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.end 
                        ? format(new Date(filters.dateRange.end), 'PPP')
                        : 'Select end date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.end ? new Date(filters.dateRange.end) : undefined}
                      onSelect={(date) => handleDateRangeChange('end', date)}
                      disabled={(date) => 
                        filters.dateRange.start
                          ? date < new Date(filters.dateRange.start)
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ltvRange" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minLTV" className="text-sm font-medium">
                  Minimum LTV
                </Label>
                <Input
                  type="number"
                  id="minLTV"
                  placeholder="Enter minimum LTV"
                  value={filters.minLTV !== undefined ? filters.minLTV.toString() : ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    handleLTVChange('minLTV', value);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxLTV" className="text-sm font-medium">
                  Maximum LTV
                </Label>
                <Input
                  type="number"
                  id="maxLTV"
                  placeholder="Enter maximum LTV"
                  value={filters.maxLTV !== undefined ? filters.maxLTV.toString() : ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    handleLTVChange('maxLTV', value);
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
