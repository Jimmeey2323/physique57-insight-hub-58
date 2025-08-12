
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversionMetricType } from '@/types/conversion';

interface ConversionMetricTabsProps {
  value: ConversionMetricType;
  onValueChange: (value: ConversionMetricType) => void;
  className?: string;
}

export const ConversionMetricTabs: React.FC<ConversionMetricTabsProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-14">
        <TabsTrigger
          value="totalClients"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Total Clients
        </TabsTrigger>
        <TabsTrigger
          value="conversionRate"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Conversion Rate
        </TabsTrigger>
        <TabsTrigger
          value="retentionRate"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Retention Rate
        </TabsTrigger>
        <TabsTrigger
          value="avgLTV"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Avg LTV
        </TabsTrigger>
        <TabsTrigger
          value="totalRevenue"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Total Revenue
        </TabsTrigger>
        <TabsTrigger
          value="avgVisitsPostTrial"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Avg Visits
        </TabsTrigger>
        <TabsTrigger
          value="newClientRate"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          New Client %
        </TabsTrigger>
        <TabsTrigger
          value="avgConversionSpan"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Conv Span
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
