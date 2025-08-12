
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Calendar, Users, Target } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FunnelInteractiveChartsProps {
  data: LeadsData[];
}

export const FunnelInteractiveCharts: React.FC<FunnelInteractiveChartsProps> = ({ data }) => {
  const [chartType1, setChartType1] = useState<'bar' | 'line' | 'area'>('bar');
  const [chartType2, setChartType2] = useState<'pie' | 'bar' | 'line'>('pie');
  const [timeFrame, setTimeFrame] = useState<'monthly' | 'weekly' | 'daily'>('monthly');

  // Process data for conversion funnel chart
  const conversionFunnelData = useMemo(() => {
    if (!data.length) return [];

    const stages = [
      { name: 'Leads Received', count: data.length },
      { name: 'Trials Scheduled', count: data.filter(l => l.stage?.includes('Trial')).length },
      { name: 'Trials Completed', count: data.filter(l => l.stage === 'Trial Completed').length },
      { name: 'Converted', count: data.filter(l => l.conversionStatus === 'Converted').length }
    ];

    return stages.map((stage, index) => ({
      ...stage,
      conversionRate: index === 0 ? 100 : ((stage.count / stages[0].count) * 100).toFixed(1),
      dropOff: index > 0 ? stages[index - 1].count - stage.count : 0
    }));
  }, [data]);

  // Process data for source performance chart
  const sourcePerformanceData = useMemo(() => {
    if (!data.length) return [];

    const sourceStats = data.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = {
          name: source,
          leads: 0,
          converted: 0,
          ltv: 0,
          visits: 0
        };
      }
      acc[source].leads += 1;
      if (lead.conversionStatus === 'Converted') acc[source].converted += 1;
      acc[source].ltv += lead.ltv || 0;
      acc[source].visits += lead.visits || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(sourceStats)
      .map((source: any) => ({
        ...source,
        conversionRate: source.leads > 0 ? ((source.converted / source.leads) * 100).toFixed(1) : '0',
        avgLTV: source.leads > 0 ? Math.round(source.ltv / source.leads) : 0,
        avgVisits: source.leads > 0 ? (source.visits / source.leads).toFixed(1) : '0'
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 10);
  }, [data]);

  // Process time-based data
  const timeBasedData = useMemo(() => {
    if (!data.length) return [];

    const groupedData = data.reduce((acc, lead) => {
      if (!lead.createdAt) return acc;
      
      const date = new Date(lead.createdAt);
      let key = '';
      
      if (timeFrame === 'monthly') {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (timeFrame === 'weekly') {
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-W${week}`;
      } else {
        key = date.toISOString().split('T')[0];
      }
      
      if (!acc[key]) {
        acc[key] = {
          period: key,
          leads: 0,
          converted: 0,
          ltv: 0,
          trials: 0
        };
      }
      
      acc[key].leads += 1;
      if (lead.conversionStatus === 'Converted') acc[key].converted += 1;
      if (lead.stage === 'Trial Completed') acc[key].trials += 1;
      acc[key].ltv += lead.ltv || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData)
      .sort((a: any, b: any) => a.period.localeCompare(b.period))
      .slice(-12); // Last 12 periods
  }, [data, timeFrame]);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const renderChart1 = () => {
    const ChartComponent = chartType1 === 'bar' ? BarChart : chartType1 === 'line' ? LineChart : AreaChart;
    
    return (
      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={conversionFunnelData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            dataKey="name" 
            stroke="#64748B"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#64748B" fontSize={12} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: any, name: string) => [
              name === 'count' ? formatNumber(value) : `${value}%`,
              name === 'count' ? 'Count' : 'Conversion Rate'
            ]}
          />
          {chartType1 === 'bar' && (
            <>
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversionRate" fill="#10B981" radius={[4, 4, 0, 0]} />
            </>
          )}
          {chartType1 === 'line' && (
            <>
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="conversionRate" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              />
            </>
          )}
          {chartType1 === 'area' && (
            <>
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const renderChart2 = () => {
    if (chartType2 === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={sourcePerformanceData.slice(0, 6)}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="leads"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {sourcePerformanceData.slice(0, 6).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [formatNumber(value), 'Leads']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const ChartComponent = chartType2 === 'bar' ? BarChart : LineChart;
    
    return (
      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={sourcePerformanceData.slice(0, 8)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            dataKey="name" 
            stroke="#64748B"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#64748B" fontSize={12} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {chartType2 === 'bar' && (
            <>
              <Bar dataKey="leads" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" fill="#10B981" radius={[4, 4, 0, 0]} />
            </>
          )}
          {chartType2 === 'line' && (
            <>
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="converted" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Conversion Funnel Chart */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <BarChart3 className="w-6 h-6 text-blue-600 animate-pulse" />
              Conversion Funnel Analysis
            </CardTitle>
            <div className="flex gap-2">
              {['bar', 'line', 'area'].map((type) => (
                <Button
                  key={type}
                  variant={chartType1 === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType1(type as any)}
                  className={cn(
                    "transition-all duration-200",
                    chartType1 === type && "bg-blue-600 text-white"
                  )}
                >
                  {type === 'bar' && <BarChart3 className="w-4 h-4" />}
                  {type === 'line' && <TrendingUp className="w-4 h-4" />}
                  {type === 'area' && <Activity className="w-4 h-4" />}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart1()}
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 font-medium mb-2">Key Insights:</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold">Drop-off Rate:</span> {conversionFunnelData.length > 1 ? 
                  `${(100 - parseFloat(conversionFunnelData[conversionFunnelData.length - 1].conversionRate)).toFixed(1)}%`
                  : 'N/A'
                }
              </div>
              <div>
                <span className="font-semibold">Best Stage:</span> Trial Completion
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Performance Chart */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Target className="w-6 h-6 text-green-600 animate-pulse" />
              Source Performance Analysis
            </CardTitle>
            <div className="flex gap-2">
              {['pie', 'bar', 'line'].map((type) => (
                <Button
                  key={type}
                  variant={chartType2 === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType2(type as any)}
                  className={cn(
                    "transition-all duration-200",
                    chartType2 === type && "bg-green-600 text-white"
                  )}
                >
                  {type === 'pie' && <PieChartIcon className="w-4 h-4" />}
                  {type === 'bar' && <BarChart3 className="w-4 h-4" />}
                  {type === 'line' && <TrendingUp className="w-4 h-4" />}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart2()}
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 font-medium mb-2">Performance Summary:</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold">Top Source:</span> {sourcePerformanceData[0]?.name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Best Conversion:</span> {
                  sourcePerformanceData.length > 0 
                    ? `${Math.max(...sourcePerformanceData.map(s => parseFloat(s.conversionRate))).toFixed(1)}%`
                    : 'N/A'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
