import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3 } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FunnelYearOnYearTableProps {
  data: LeadsData[];
}

type MetricType = 'totalLeads' | 'trialsCompleted' | 'trialsScheduled' | 'proximityIssues' | 'convertedLeads' | 'trialToMemberRate' | 'leadToTrialRate' | 'leadToMemberRate' | 'ltv' | 'avgVisits' | 'pipelineHealth';

export const FunnelYearOnYearTable: React.FC<FunnelYearOnYearTableProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalLeads');

  const generateMonths = () => {
    const years = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    for (let year = currentYear; year >= 2024; year--) {
      years.push({ key: String(year), name: String(year), year });
    }
    
    return years;
  };

  const months = generateMonths();

  const processedData = useMemo(() => {
    if (!data.length) return [];

    const sourceData = data.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = {};
      }
      
      if (lead.createdAt) {
        const date = new Date(lead.createdAt);
        const yearKey = String(date.getFullYear());
        
        if (!acc[source][yearKey]) {
          acc[source][yearKey] = {
            totalLeads: 0,
            trialsCompleted: 0,
            trialsScheduled: 0,
            proximityIssues: 0,
            convertedLeads: 0,
            totalLTV: 0,
            totalVisits: 0
          };
        }
        
        const yearData = acc[source][yearKey];
        yearData.totalLeads += 1;
        
        if (lead.stage === 'Trial Completed') yearData.trialsCompleted += 1;
        if (lead.stage?.includes('Trial')) yearData.trialsScheduled += 1;
        if (lead.stage === 'Proximity Issues') yearData.proximityIssues += 1;
        if (lead.conversionStatus === 'Converted') yearData.convertedLeads += 1;
        
        yearData.totalLTV += lead.ltv || 0;
        yearData.totalVisits += lead.visits || 0;
      }
      
      return acc;
    }, {} as Record<string, Record<string, any>>);

    return Object.keys(sourceData).map(source => {
      const sourceStats = sourceData[source];
      const result: any = { source };
      
      months.forEach(month => {
        const yearData = sourceStats[month.key] || {
          totalLeads: 0,
          trialsCompleted: 0,
          trialsScheduled: 0,
          proximityIssues: 0,
          convertedLeads: 0,
          totalLTV: 0,
          totalVisits: 0
        };
        
        const trialToMemberRate = yearData.trialsCompleted > 0 ? (yearData.convertedLeads / yearData.trialsCompleted) * 100 : 0;
        const leadToTrialRate = yearData.totalLeads > 0 ? (yearData.trialsCompleted / yearData.totalLeads) * 100 : 0;
        const leadToMemberRate = yearData.totalLeads > 0 ? (yearData.convertedLeads / yearData.totalLeads) * 100 : 0;
        const avgLTV = yearData.totalLeads > 0 ? yearData.totalLTV / yearData.totalLeads : 0;
        const avgVisits = yearData.totalLeads > 0 ? yearData.totalVisits / yearData.totalLeads : 0;
        const pipelineHealth = yearData.totalLeads > 0 ? ((yearData.totalLeads - yearData.proximityIssues) / yearData.totalLeads) * 100 : 0;
        
        result[month.key] = {
          totalLeads: yearData.totalLeads,
          trialsCompleted: yearData.trialsCompleted,
          trialsScheduled: yearData.trialsScheduled,
          proximityIssues: yearData.proximityIssues,
          convertedLeads: yearData.convertedLeads,
          trialToMemberRate,
          leadToTrialRate,
          leadToMemberRate,
          ltv: avgLTV,
          avgVisits,
          pipelineHealth
        };
      });
      
      return result;
    }).filter(source => {
      return months.some(month => source[month.key]?.totalLeads > 0);
    });
  }, [data, months]);

  const totals = useMemo(() => {
    const result: any = { source: 'TOTALS' };
    
    months.forEach(month => {
      const yearTotals = processedData.reduce((acc, source) => {
        const yearData = source[month.key] || {};
        acc.totalLeads += yearData.totalLeads || 0;
        acc.trialsCompleted += yearData.trialsCompleted || 0;
        acc.trialsScheduled += yearData.trialsScheduled || 0;
        acc.proximityIssues += yearData.proximityIssues || 0;
        acc.convertedLeads += yearData.convertedLeads || 0;
        acc.totalLTV += (yearData.ltv || 0) * (yearData.totalLeads || 0);
        acc.totalVisits += (yearData.avgVisits || 0) * (yearData.totalLeads || 0);
        return acc;
      }, {
        totalLeads: 0,
        trialsCompleted: 0,
        trialsScheduled: 0,
        proximityIssues: 0,
        convertedLeads: 0,
        totalLTV: 0,
        totalVisits: 0
      });
      
      const trialToMemberRate = yearTotals.trialsCompleted > 0 ? (yearTotals.convertedLeads / yearTotals.trialsCompleted) * 100 : 0;
      const leadToTrialRate = yearTotals.totalLeads > 0 ? (yearTotals.trialsCompleted / yearTotals.totalLeads) * 100 : 0;
      const leadToMemberRate = yearTotals.totalLeads > 0 ? (yearTotals.convertedLeads / yearTotals.totalLeads) * 100 : 0;
      const avgLTV = yearTotals.totalLeads > 0 ? yearTotals.totalLTV / yearTotals.totalLeads : 0;
      const avgVisits = yearTotals.totalLeads > 0 ? yearTotals.totalVisits / yearTotals.totalLeads : 0;
      const pipelineHealth = yearTotals.totalLeads > 0 ? ((yearTotals.totalLeads - yearTotals.proximityIssues) / yearTotals.totalLeads) * 100 : 0;
      
      result[month.key] = {
        totalLeads: yearTotals.totalLeads,
        trialsCompleted: yearTotals.trialsCompleted,
        trialsScheduled: yearTotals.trialsScheduled,
        proximityIssues: yearTotals.proximityIssues,
        convertedLeads: yearTotals.convertedLeads,
        trialToMemberRate,
        leadToTrialRate,
        leadToMemberRate,
        ltv: avgLTV,
        avgVisits,
        pipelineHealth
      };
    });
    
    return result;
  }, [processedData, months]);

  const formatValue = (value: any, metric: MetricType) => {
    if (typeof value !== 'object' || !value) return '-';
    
    const metricValue = value[metric];
    if (metricValue === undefined || metricValue === 0) return '-';
    
    switch (metric) {
      case 'ltv':
        return formatCurrency(metricValue);
      case 'trialToMemberRate':
      case 'leadToTrialRate':
      case 'leadToMemberRate':
      case 'pipelineHealth':
        return `${metricValue.toFixed(1)}%`;
      case 'avgVisits':
        return metricValue.toFixed(1);
      default:
        return metricValue.toLocaleString('en-IN');
    }
  };

  const getGrowthPercentage = (currentValue: any, previousValue: any, metric: MetricType) => {
    if (!currentValue || !previousValue) return null;
    
    const current = currentValue[metric];
    const previous = previousValue[metric];
    
    if (!current || !previous || previous === 0) return null;
    
    return ((current - previous) / previous) * 100;
  };

  const metricTabs = [
    { value: 'totalLeads', label: 'Total Leads' },
    { value: 'trialsCompleted', label: 'Trials Completed' },
    { value: 'trialsScheduled', label: 'Trials Scheduled' },
    { value: 'proximityIssues', label: 'Proximity Issues' },
    { value: 'convertedLeads', label: 'Converted Leads' },
    { value: 'trialToMemberRate', label: 'Trial → Member Rate' },
    { value: 'leadToTrialRate', label: 'Lead → Trial Rate' },
    { value: 'leadToMemberRate', label: 'Lead → Member Rate' },
    { value: 'ltv', label: 'Average LTV' },
    { value: 'avgVisits', label: 'Avg Visits/Lead' },
    { value: 'pipelineHealth', label: 'Pipeline Health' }
  ];

  const columns = [
    {
      key: 'source',
      header: 'Source',
      render: (value: string) => (
        <div className="font-semibold text-slate-800 min-w-[150px]">
          {value}
        </div>
      ),
      align: 'left' as const
    },
    ...months.map(month => ({
      key: month.key,
      header: month.name,
      render: (value: any, row: any) => {
        const growth = getGrowthPercentage(value, processedData.find(d => d.source === row.source)?.[String(Number(month.key) - 1)], selectedMetric);
        
        return (
          <div className="text-center font-medium">
            {formatValue(value, selectedMetric)}
            {growth !== null && (
              <div className={`text-xs ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({growth > 0 ? '+' : ''}{growth.toFixed(1)}%)
              </div>
            )}
          </div>
        );
      },
      align: 'center' as const
    }))
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
          <Calendar className="w-6 h-6 animate-pulse" />
          Year-on-Year Source Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Metric Selector */}
        <div className="p-6 border-b border-slate-200">
          <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricType)}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 gap-2 h-auto p-1">
              {metricTabs.map(tab => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="text-xs p-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <BarChart3 className="w-3 h-3 mr-1" />
              {metricTabs.find(t => t.value === selectedMetric)?.label}
            </Badge>
            <span className="text-sm text-slate-600">
              Showing {processedData.length} sources across {months.length} years
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
            showFooter={true}
            footerData={totals}
            maxHeight="500px"
            className="rounded-none"
          />
        </div>

        {/* Summary Section */}
        <div className="p-6 bg-slate-50 border-t">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Performance Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Top Source (Volume):</span>
              <div className="font-bold text-blue-600">
                {processedData.length > 0 ? processedData[0].source : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Active Sources:</span>
              <div className="font-bold text-slate-800">
                {processedData.length}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Current Year Total:</span>
              <div className="font-bold text-green-600">
                {months.length > 0 ? formatValue(totals[months[0].key], selectedMetric) : '-'}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Data Range:</span>
              <div className="font-bold text-slate-800">
                {months.length > 0 ? `${months[months.length - 1].name} - ${months[0].name}` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
