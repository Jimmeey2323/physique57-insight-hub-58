
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { useClientConversionData } from '@/hooks/useClientConversionData';
import { ConversionRetentionFilterSection } from '@/components/dashboard/ConversionRetentionFilterSection';
import { EnhancedClientConversionMetrics } from '@/components/dashboard/EnhancedClientConversionMetrics';
import { ConversionAnalyticsTables } from '@/components/dashboard/ConversionAnalyticsTables';
import { ConversionMetricTabs } from '@/components/dashboard/ConversionMetricTabs';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { ConversionRetentionFilters, ConversionMetricType } from '@/types/conversion';
import { getPreviousMonthDateRange, parseDate } from '@/utils/dateUtils';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

export default function ConversionRetention() {
  const { data, loading, error } = useClientConversionData();
  const [selectedMetric, setSelectedMetric] = useState<ConversionMetricType>('totalClients');
  
  const [filters, setFilters] = useState<ConversionRetentionFilters>(() => {
    const previousMonth = getPreviousMonthDateRange();
    return {
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
    };
  });

  // Extract filter options from data
  const filterOptions = useMemo(() => {
    const locations = [...new Set(data.map(item => item.firstVisitLocation).filter(Boolean))];
    const homeLocations = [...new Set(data.map(item => item.homeLocation).filter(Boolean))];
    const trainers = [...new Set(data.map(item => item.trainerName).filter(Boolean))];
    const paymentMethods = [...new Set(data.map(item => item.paymentMethod).filter(Boolean))];
    const retentionStatus = [...new Set(data.map(item => item.retentionStatus).filter(Boolean))];
    const conversionStatus = [...new Set(data.map(item => item.conversionStatus).filter(Boolean))];
    const isNew = [...new Set(data.map(item => item.isNew).filter(Boolean))];
    const firstVisitTypes = [...new Set(data.map(item => item.firstVisitType).filter(Boolean))];

    return {
      locations: locations.sort(),
      homeLocations: homeLocations.sort(),
      trainers: trainers.sort(),
      paymentMethods: paymentMethods.sort(),
      retentionStatus: retentionStatus.sort(),
      conversionStatus: conversionStatus.sort(),
      isNew: isNew.sort(),
      firstVisitTypes: firstVisitTypes.sort()
    };
  }, [data]);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const visitDate = parseDate(item.firstVisitDate);
      const filterStartDate = new Date(filters.dateRange.start);
      const filterEndDate = new Date(filters.dateRange.end);

      // Date range filter
      if (visitDate && (visitDate < filterStartDate || visitDate > filterEndDate)) {
        return false;
      }

      // Location filters
      if (filters.location.length > 0 && !filters.location.includes(item.firstVisitLocation)) {
        return false;
      }

      if (filters.homeLocation.length > 0 && !filters.homeLocation.includes(item.homeLocation)) {
        return false;
      }

      // Trainer filter
      if (filters.trainer.length > 0 && !filters.trainer.includes(item.trainerName)) {
        return false;
      }

      // Payment method filter
      if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(item.paymentMethod)) {
        return false;
      }

      // Status filters
      if (filters.retentionStatus.length > 0 && !filters.retentionStatus.includes(item.retentionStatus)) {
        return false;
      }

      if (filters.conversionStatus.length > 0 && !filters.conversionStatus.includes(item.conversionStatus)) {
        return false;
      }

      if (filters.isNew.length > 0 && !filters.isNew.includes(item.isNew)) {
        return false;
      }

      if (filters.firstVisitType.length > 0 && !filters.firstVisitType.includes(item.firstVisitType)) {
        return false;
      }

      // Numeric filters
      if (filters.minLTV !== undefined && item.ltv < filters.minLTV) {
        return false;
      }

      if (filters.maxLTV !== undefined && item.ltv > filters.maxLTV) {
        return false;
      }

      if (filters.minVisitsPostTrial !== undefined && item.visitsPostTrial < filters.minVisitsPostTrial) {
        return false;
      }

      if (filters.maxVisitsPostTrial !== undefined && item.visitsPostTrial > filters.maxVisitsPostTrial) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  // Calculate metrics for month-on-month analysis
  const monthlyMetrics = useMemo(() => {
    const monthlyData: Record<string, any> = {};
    
    filteredData.forEach(item => {
      const visitDate = parseDate(item.firstVisitDate);
      if (!visitDate) return;
      
      const monthKey = `${visitDate.getFullYear()}-${(visitDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          totalClients: 0,
          convertedClients: 0,
          retainedClients: 0,
          newClients: 0,
          totalLTV: 0,
          totalVisitsPostTrial: 0,
          conversionSpanTotal: 0,
          conversionSpanCount: 0
        };
      }
      
      monthlyData[monthKey].totalClients++;
      if (item.conversionStatus === 'Converted') monthlyData[monthKey].convertedClients++;
      if (item.retentionStatus === 'Retained') monthlyData[monthKey].retainedClients++;
      if (item.isNew === 'New') monthlyData[monthKey].newClients++;
      monthlyData[monthKey].totalLTV += item.ltv || 0;
      monthlyData[monthKey].totalVisitsPostTrial += item.visitsPostTrial || 0;
      if (item.conversionSpan > 0) {
        monthlyData[monthKey].conversionSpanTotal += item.conversionSpan;
        monthlyData[monthKey].conversionSpanCount++;
      }
    });

    // Calculate derived metrics
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      data.conversionRate = data.totalClients > 0 ? (data.convertedClients / data.totalClients) * 100 : 0;
      data.retentionRate = data.totalClients > 0 ? (data.retainedClients / data.totalClients) * 100 : 0;
      data.avgLTV = data.totalClients > 0 ? data.totalLTV / data.totalClients : 0;
      data.avgVisitsPostTrial = data.totalClients > 0 ? data.totalVisitsPostTrial / data.totalClients : 0;
      data.newClientRate = data.totalClients > 0 ? (data.newClients / data.totalClients) * 100 : 0;
      data.avgConversionSpan = data.conversionSpanCount > 0 ? data.conversionSpanTotal / data.conversionSpanCount : 0;
    });

    return monthlyData;
  }, [filteredData]);

  if (loading) {
    return <RefinedLoader message="Loading conversion & retention data..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Please try refreshing the page or contact support if the issue persists.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversion & Retention Analytics</h1>
          <p className="text-gray-600 mb-4">
            Track client conversion rates, retention metrics, and lifetime value analysis
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {formatNumber(filteredData.length)} Clients
        </Badge>
      </div>

      <ConversionRetentionFilterSection
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-14">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
          >
            <TrendingUp className="w-4 h-4" />
            Analytics Tables
          </TabsTrigger>
          <TabsTrigger
            value="monthOnMonth"
            className="flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
          >
            <Activity className="w-4 h-4" />
            Month on Month
          </TabsTrigger>
          <TabsTrigger
            value="yearOnYear"
            className="flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
          >
            <Target className="w-4 h-4" />
            Year on Year
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EnhancedClientConversionMetrics data={filteredData} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ConversionAnalyticsTables 
            data={filteredData}
            onItemClick={(item) => console.log('Analytics item clicked:', item)}
          />
        </TabsContent>

        <TabsContent value="monthOnMonth" className="space-y-6">
          <ConversionMetricTabs
            value={selectedMetric}
            onValueChange={setSelectedMetric}
            className="mb-6"
          />
          
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Month on Month Analysis - {selectedMetric.replace(/([A-Z])/g, ' $1').trim()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Value</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Change</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">% Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(monthlyMetrics)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([month, data], index, array) => {
                        const prevData = index > 0 ? array[index - 1][1] : null;
                        const currentValue = data[selectedMetric];
                        const prevValue = prevData ? prevData[selectedMetric] : null;
                        const change = prevValue !== null ? currentValue - prevValue : 0;
                        const percentChange = prevValue && prevValue !== 0 ? (change / prevValue) * 100 : 0;
                        
                        const formatValue = (value: number) => {
                          switch (selectedMetric) {
                            case 'totalClients':
                              return formatNumber(value);
                            case 'conversionRate':
                            case 'retentionRate':
                            case 'newClientRate':
                              return formatPercentage(value / 100);
                            case 'avgLTV':
                            case 'totalRevenue':
                              return formatCurrency(value);
                            case 'avgVisitsPostTrial':
                              return value.toFixed(1);
                            case 'avgConversionSpan':
                              return `${value.toFixed(0)} days`;
                            default:
                              return formatNumber(value);
                          }
                        };

                        return (
                          <tr key={month} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{month}</td>
                            <td className="py-3 px-4 text-right">{formatValue(currentValue)}</td>
                            <td className="py-3 px-4 text-right">
                              {index === 0 ? '-' : (
                                <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {change >= 0 ? '+' : ''}{formatValue(change)}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {index === 0 ? '-' : (
                                <Badge 
                                  variant={percentChange >= 0 ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearOnYear" className="space-y-6">
          <ConversionMetricTabs
            value={selectedMetric}
            onValueChange={setSelectedMetric}
            className="mb-6"
          />
          
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-violet-50">
              <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Year on Year Comparison - {selectedMetric.replace(/([A-Z])/g, ' $1').trim()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">2024</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">2025</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">YoY Change</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">YoY %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(month => {
                      const data2024 = monthlyMetrics[`2024-${month}`];
                      const data2025 = monthlyMetrics[`2025-${month}`];
                      const value2024 = data2024 ? data2024[selectedMetric] : 0;
                      const value2025 = data2025 ? data2025[selectedMetric] : 0;
                      const change = value2025 - value2024;
                      const percentChange = value2024 !== 0 ? (change / value2024) * 100 : 0;

                      const formatValue = (value: number) => {
                        switch (selectedMetric) {
                          case 'totalClients':
                            return formatNumber(value);
                          case 'conversionRate':
                          case 'retentionRate':
                          case 'newClientRate':
                            return formatPercentage(value / 100);
                          case 'avgLTV':
                          case 'totalRevenue':
                            return formatCurrency(value);
                          case 'avgVisitsPostTrial':
                            return value.toFixed(1);
                          case 'avgConversionSpan':
                            return `${value.toFixed(0)} days`;
                          default:
                            return formatNumber(value);
                        }
                      };

                      const monthName = new Date(2024, parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'short' });

                      return (
                        <tr key={month} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{monthName}</td>
                          <td className="py-3 px-4 text-right">{value2024 > 0 ? formatValue(value2024) : '-'}</td>
                          <td className="py-3 px-4 text-right">{value2025 > 0 ? formatValue(value2025) : '-'}</td>
                          <td className="py-3 px-4 text-right">
                            {value2024 === 0 && value2025 === 0 ? '-' : (
                              <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {change >= 0 ? '+' : ''}{formatValue(change)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {value2024 === 0 && value2025 === 0 ? '-' : (
                              <Badge 
                                variant={percentChange >= 0 ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
