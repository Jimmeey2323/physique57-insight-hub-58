
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
  Users,
  MapPin,
  User,
  DollarSign,
  Target
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
import { ConversionRetentionFilters } from '@/types/conversion';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

interface ConversionRetentionFilterSectionProps {
  filters: ConversionRetentionFilters;
  setFilters: (filters: ConversionRetentionFilters) => void;
  options: {
    locations: string[];
    homeLocations: string[];
    trainers: string[];
    paymentMethods: string[];
    retentionStatus: string[];
    conversionStatus: string[];
    isNew: string[];
    firstVisitTypes: string[];
  };
}

export const ConversionRetentionFilterSection: React.FC<ConversionRetentionFilterSectionProps> = ({
  filters,
  setFilters,
  options
}) => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const filterConfigs = [
    {
      key: 'location',
      label: 'Locations',
      icon: MapPin,
      options: options.locations,
      values: filters.location,
      description: 'Filter by visit locations'
    },
    {
      key: 'homeLocation',
      label: 'Home Locations',
      icon: MapPin,
      options: options.homeLocations,
      values: filters.homeLocation,
      description: 'Filter by home locations'
    },
    {
      key: 'trainer',
      label: 'Trainers',
      icon: User,
      options: options.trainers,
      values: filters.trainer,
      description: 'Filter by trainers'
    },
    {
      key: 'paymentMethod',
      label: 'Payment Methods',
      icon: DollarSign,
      options: options.paymentMethods,
      values: filters.paymentMethod,
      description: 'Filter by payment methods'
    },
    {
      key: 'retentionStatus',
      label: 'Retention Status',
      icon: Target,
      options: options.retentionStatus,
      values: filters.retentionStatus,
      description: 'Filter by retention status'
    },
    {
      key: 'conversionStatus',
      label: 'Conversion Status',
      icon: Target,
      options: options.conversionStatus,
      values: filters.conversionStatus,
      description: 'Filter by conversion status'
    },
    {
      key: 'isNew',
      label: 'New/Existing',
      icon: Users,
      options: options.isNew,
      values: filters.isNew,
      description: 'Filter by new vs existing'
    },
    {
      key: 'firstVisitType',
      label: 'Visit Types',
      icon: Target,
      options: options.firstVisitTypes,
      values: filters.firstVisitType,
      description: 'Filter by first visit types'
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    const currentValues = [...(filters[filterKey as keyof ConversionRetentionFilters] as string[])];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    setFilters({ 
      ...filters, 
      [filterKey]: currentValues 
    });
  };

  const handleDateRangeChange = (type: 'start' | 'end', dateString: string) => {
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: dateString
      }
    });
  };

  const handleNumericFilterChange = (filterKey: string, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFilters({
      ...filters,
      [filterKey]: numValue
    });
  };

  const clearFilter = (filterKey: string) => {
    setFilters({
      ...filters,
      [filterKey]: []
    });
  };

  const clearAllFilters = () => {
    const previousMonth = getPreviousMonthDateRange();
    setFilters({
      dateRange: previousMonth,
      location: [],
      homeLocation: [],
      trainer: [],
      paymentMethod: [],
      retentionStatus: [],
      conversionStatus: [],
      isNew: [],
      firstVisitType: [],
      minLTV: undefined,
      maxLTV: undefined,
      minVisitsPostTrial: undefined,
      maxVisitsPostTrial: undefined
    });
  };

  const activeFilterCount = filterConfigs.reduce((count, config) => {
    return count + config.values.length;
  }, 0) + (filters.minLTV ? 1 : 0) + (filters.maxLTV ? 1 : 0) + 
  (filters.minVisitsPostTrial ? 1 : 0) + (filters.maxVisitsPostTrial ? 1 : 0);

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
            Conversion & Retention Filters
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
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="dateRange">Date Range</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterConfigs.slice(0, 4).map((config) => (
                <MultiSelectFilter key={config.key} config={config} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterConfigs.slice(4).map((config) => (
                <MultiSelectFilter key={config.key} config={config} />
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Min LTV</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minLTV || ''}
                  onChange={(e) => handleNumericFilterChange('minLTV', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max LTV</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxLTV || ''}
                  onChange={(e) => handleNumericFilterChange('maxLTV', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Min Visits Post Trial</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minVisitsPostTrial || ''}
                  onChange={(e) => handleNumericFilterChange('minVisitsPostTrial', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Visits Post Trial</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxVisitsPostTrial || ''}
                  onChange={(e) => handleNumericFilterChange('maxVisitsPostTrial', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dateRange" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  End Date
                </Label>
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
