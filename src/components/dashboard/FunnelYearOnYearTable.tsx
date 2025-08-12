
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, TrendingDown } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FunnelYearOnYearTableProps {
  data: LeadsData[];
}

type MetricType = 'totalLeads' | 'convertedLeads' | 'ltv' | 'conversionRate';

export const FunnelYearOnYearTable: React.FC<FunnelYearOnYearTableProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalLeads');

  const processedData = useMemo(() => {
    if (!data.length) return [];

    // Group data by source and month-year
    const sourceData = data.reduce((acc, lead) => {
      if (!lead.createdAt) return acc;
      
      const date = new Date(lead.createdAt);
      const source = lead.source || 'Unknown';
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${month.toString().padStart(2, '0')}`;
      
      if (!acc[source]) acc[source] = {};
      if (!acc[source][monthKey]) acc[source][monthKey] = {};
      if (!acc[source][monthKey][year]) {
        acc[source][monthKey][year] = {
          totalLeads: 0,
          convertedLeads: 0,
          totalLTV: 0
        };
      }
      
      acc[source][monthKey][year].totalLeads += 1;
      if (lead.conversionStatus === 'Converted') acc[source][monthKey][year].convertedLeads += 1;
      acc[source][monthKey][year].totalLTV += lead.ltv || 0;
      
      return acc;
    }, {} as Record<string, Record<string, Record<number, any>>>);

    // Get all available years
    const allYears = new Set<number>();
    Object.values(sourceData).forEach(sourceMonths => {
      Object.values(sourceMonths).forEach(monthData => {
        Object.keys(monthData).forEach(year => allYears.add(parseInt(year)));
      });
    });
    const years = Array.from(allYears).sort((a, b) => b - a);

    // Convert to table format with YoY comparisons
    const tableData: any[] = [];
    
    Object.keys(sourceData).forEach(source => {
      const sourceMonths = sourceData[source];
      
      for (let month = 1; month <= 12; month++) {
        const monthKey = month.toString().padStart(2, '0');
        const monthName = new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' });
        const monthData = sourceMonths[monthKey] || {};
        
        const rowData: any = {
          source,
          month: monthName,
          sourceMonth: `${source} - ${monthName}`
        };
        
        years.forEach(year => {
          const yearData = monthData[year] || { totalLeads: 0, convertedLeads: 0, totalLTV: 0 };
          const conversionRate = yearData.totalLeads > 0 ? (yearData.convertedLeads / yearData.totalLeads) * 100 : 0;
          const avgLTV = yearData.totalLeads > 0 ? yearData.totalLTV / yearData.totalLeads : 0;
          
          rowData[year] = {
            totalLeads: yearData.totalLeads,
            convertedLeads: yearData.convertedLeads,
            ltv: avgLTV,
            conversionRate
          };
        });
        
        // Calculate YoY growth
        if (years.length >= 2) {
          const currentYear = years[0];
          const previousYear = years[1];
          const current = rowData[currentYear] || {};
          const previous = rowData[previousYear] || {};
          
          if (previous[selectedMetric] > 0) {
            const growth = ((current[selectedMetric] - previous[selectedMetric]) / previous[selectedMetric]) * 100;
            rowData.yoyGrowth = growth;
          } else {
            rowData.yoyGrowth = current[selectedMetric] > 0 ? 100 : 0;
          }
        }
        
        // Only include rows with some data
        if (years.some(year => rowData[year]?.totalLeads > 0)) {
          tableData.push(rowData);
        }
      }
    });

    return tableData.sort((a, b) => a.sourceMonth.localeCompare(b.sourceMonth));
  }, [data, selectedMetric]);

  const years = useMemo(() => {
    const allYears = new Set<number>();
    data.forEach(lead => {
      if (lead.createdAt) {
        allYears.add(new Date(lead.createdAt).getFullYear());
      }
    });
    return Array.from(allYears).sort((a, b) => b - a);
  }, [data]);

  const formatValue = (value: any, metric: MetricType) => {
    if (typeof value !== 'object' || !value) return '-';
    
    const metricValue = value[metric];
    if (metricValue === undefined || metricValue === 0) return '-';
    
    switch (metric) {
      case 'ltv':
        return formatCurrency(metricValue);
      case 'conversionRate':
        return `${metricValue.toFixed(1)}%`;
      default:
        return formatNumber(metricValue);
    }
  };

  const columns = [
    {
      key: 'sourceMonth',
      header: 'Source - Month',
      render: (value: string) => {
        const [source, month] = value.split(' - ');
        return (
          <div className="min-w-[200px] text-left">
            <div className="font-semibold text-slate-800">{source}</div>
            <div className="text-xs text-slate-500">{month}</div>
          </div>
        );
      },
      align: 'left' as const
    },
    ...years.map(year => ({
      key: year.toString(),
      header: year.toString(),
      render: (value: any) => (
        <div className="text-center font-medium">
          {formatValue(value, selectedMetric)}
        </div>
      ),
      align: 'center' as const
    })),
    {
      key: 'yoyGrowth',
      header: 'YoY Growth',
      render: (value: number) => {
        if (value === undefined || value === null) return '-';
        const isPositive = value > 0;
        return (
          <div className="text-center">
            <Badge 
              variant={isPositive ? "default" : "destructive"}
              className="gap-1"
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatPercentage(value)}
            </Badge>
          </div>
        );
      },
      align: 'center' as const
    }
  ];

  const metricTabs = [
    { value: 'totalLeads', label: 'Total Leads' },
    { value: 'convertedLeads', label: 'Converted Leads' },
    { value: 'ltv', label: 'Average LTV' },
    { value: 'conversionRate', label: 'Conversion Rate' }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
        <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
          <CalendarDays className="w-6 h-6 animate-pulse" />
          Year-on-Year Performance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Metric Selector */}
        <div className="p-6 border-b border-slate-200">
          <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricType)}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-1">
              {metricTabs.map(tab => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="text-xs p-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CalendarDays className="w-3 h-3 mr-1" />
              {metricTabs.find(t => t.value === selectedMetric)?.label}
            </Badge>
            <span className="text-sm text-slate-600">
              Comparing {years.join(', ')} across all months
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="max-h-[600px] overflow-auto">
          <ModernDataTable
            data={processedData}
            columns={columns}
            loading={false}
            stickyHeader={true}
            maxHeight="500px"
            className="rounded-none"
          />
        </div>

        {/* Summary Section */}
        <div className="p-6 bg-slate-50 border-t">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-slate-800">YoY Growth Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Avg Growth Rate:</span>
              <div className="font-bold text-green-600">
                {processedData.length > 0 
                  ? formatPercentage(processedData.reduce((sum, row) => sum + (row.yoyGrowth || 0), 0) / processedData.length)
                  : 'N/A'
                }
              </div>
            </div>
            <div>
              <span className="text-slate-600">Best Growth:</span>
              <div className="font-bold text-blue-600">
                {processedData.length > 0 
                  ? formatPercentage(Math.max(...processedData.map(row => row.yoyGrowth || 0)))
                  : 'N/A'
                }
              </div>
            </div>
            <div>
              <span className="text-slate-600">Years Compared:</span>
              <div className="font-bold text-slate-800">
                {years.length}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Data Points:</span>
              <div className="font-bold text-slate-800">
                {processedData.length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
