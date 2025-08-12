
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Users, Target, Calendar, Filter } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FunnelInteractiveChartsProps {
  data: LeadsData[];
}

export const FunnelInteractiveCharts: React.FC<FunnelInteractiveChartsProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'source' | 'stage' | 'timeline'>('source');
  const [metricType, setMetricType] = useState<'volume' | 'conversion' | 'ltv'>('volume');

  const chartData = useMemo(() => {
    if (!data || !data.length) return [];

    switch (chartType) {
      case 'source': {
        const sourceStats = data.reduce((acc, lead) => {
          const source = lead.source || 'Unknown';
          if (!acc[source]) {
            acc[source] = { name: source, leads: 0, converted: 0, totalLTV: 0 };
          }
          acc[source].leads += 1;
          if (lead.conversionStatus === 'Converted') acc[source].converted += 1;
          acc[source].totalLTV += lead.ltv || 0;
          return acc;
        }, {} as Record<string, any>);

        return Object.values(sourceStats)
          .map((source: any) => ({
            name: source.name,
            volume: source.leads,
            conversion: source.leads > 0 ? (source.converted / source.leads) * 100 : 0,
            ltv: source.leads > 0 ? source.totalLTV / source.leads : 0
          }))
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 10);
      }

      case 'stage': {
        const stageStats = data.reduce((acc, lead) => {
          const stage = lead.stage || 'Unknown';
          if (!acc[stage]) {
            acc[stage] = { name: stage, leads: 0, converted: 0, totalLTV: 0 };
          }
          acc[stage].leads += 1;
          if (lead.conversionStatus === 'Converted') acc[stage].converted += 1;
          acc[stage].totalLTV += lead.ltv || 0;
          return acc;
        }, {} as Record<string, any>);

        return Object.values(stageStats)
          .map((stage: any) => ({
            name: stage.name,
            volume: stage.leads,
            conversion: stage.leads > 0 ? (stage.converted / stage.leads) * 100 : 0,
            ltv: stage.leads > 0 ? stage.totalLTV / stage.leads : 0
          }))
          .sort((a, b) => b.volume - a.volume);
      }

      case 'timeline': {
        const monthlyStats = data.reduce((acc, lead) => {
          if (!lead.createdAt) return acc;
          
          const date = new Date(lead.createdAt);
          if (isNaN(date.getTime())) return acc;
          
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!acc[monthKey]) {
            acc[monthKey] = { name: monthKey, leads: 0, converted: 0, totalLTV: 0 };
          }
          acc[monthKey].leads += 1;
          if (lead.conversionStatus === 'Converted') acc[monthKey].converted += 1;
          acc[monthKey].totalLTV += lead.ltv || 0;
          return acc;
        }, {} as Record<string, any>);

        return Object.values(monthlyStats)
          .map((month: any) => ({
            name: month.name,
            volume: month.leads,
            conversion: month.leads > 0 ? (month.converted / month.leads) * 100 : 0,
            ltv: month.leads > 0 ? month.totalLTV / month.leads : 0
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(-12);
      }

      default:
        return [];
    }
  }, [data, chartType]);

  const pieData = useMemo(() => {
    if (!data || !data.length) return [];

    const conversionStats = data.reduce((acc, lead) => {
      const status = lead.conversionStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    return Object.entries(conversionStats)
      .map(([status, count], index) => ({
        name: status,
        value: count,
        percentage: ((count / data.length) * 100).toFixed(1),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const getChartTitle = () => {
    const typeMap = {
      source: 'Source Analysis',
      stage: 'Stage Analysis', 
      timeline: 'Timeline Analysis'
    };
    return typeMap[chartType];
  };

  const getMetricValue = (item: any) => {
    switch (metricType) {
      case 'volume': return item.volume;
      case 'conversion': return item.conversion;
      case 'ltv': return item.ltv;
      default: return item.volume;
    }
  };

  const getMetricLabel = () => {
    switch (metricType) {
      case 'volume': return 'Lead Volume';
      case 'conversion': return 'Conversion Rate (%)';
      case 'ltv': return 'Average LTV (₹)';
      default: return 'Lead Volume';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800">{label}</p>
          <p className="text-sm text-slate-600">
            {getMetricLabel()}: {
              metricType === 'ltv' 
                ? formatCurrency(payload[0].value)
                : metricType === 'conversion'
                ? `${payload[0].value.toFixed(1)}%`
                : formatNumber(payload[0].value)
            }
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800">{data.name}</p>
          <p className="text-sm text-slate-600">
            Count: {formatNumber(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || !data.length) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center py-8 text-slate-500">
              No data available for charts
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center py-8 text-slate-500">
              No data available for charts
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main Chart */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <BarChart3 className="w-6 h-6 text-blue-600 animate-pulse" />
              {getChartTitle()}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'source' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('source')}
                className="text-xs"
              >
                <Users className="w-3 h-3 mr-1" />
                Sources
              </Button>
              <Button
                variant={chartType === 'stage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('stage')}
                className="text-xs"
              >
                <Target className="w-3 h-3 mr-1" />
                Stages
              </Button>
              <Button
                variant={chartType === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('timeline')}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Timeline
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Badge 
              variant={metricType === 'volume' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMetricType('volume')}
            >
              Volume
            </Badge>
            <Badge 
              variant={metricType === 'conversion' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMetricType('conversion')}
            >
              Conversion
            </Badge>
            <Badge 
              variant={metricType === 'ltv' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMetricType('ltv')}
            >
              LTV
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'timeline' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => String(value).slice(-5)}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey={metricType} 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#1d4ed8' }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey={metricType} 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <PieChartIcon className="w-6 h-6 text-purple-600 animate-pulse" />
            Conversion Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {value} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
