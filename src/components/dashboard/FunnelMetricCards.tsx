
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Zap
} from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FunnelMetricCardsProps {
  data: LeadsData[];
}

export const FunnelMetricCards: React.FC<FunnelMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    if (!data || !data.length) {
      return {
        leadsReceived: 0,
        trialsCompleted: 0,
        trialsScheduled: 0,
        proximityIssues: 0,
        convertedLeads: 0,
        trialToMemberConversion: 0,
        leadToTrialConversion: 0,
        leadToMemberConversion: 0,
        avgLTV: 0,
        avgVisitsPerLead: 0,
        pipelineHealth: 0
      };
    }

    const leadsReceived = data.length;
    const trialsCompleted = data.filter(lead => lead.stage === 'Trial Completed').length;
    const trialsScheduled = data.filter(lead => lead.stage?.includes('Trial')).length;
    const proximityIssues = data.filter(lead => lead.stage?.includes('Proximity') || lead.remarks?.toLowerCase().includes('proximity')).length;
    const convertedLeads = data.filter(lead => lead.conversionStatus === 'Converted').length;
    
    const trialToMemberConversion = trialsCompleted > 0 ? (convertedLeads / trialsCompleted) * 100 : 0;
    const leadToTrialConversion = leadsReceived > 0 ? (trialsScheduled / leadsReceived) * 100 : 0;
    const leadToMemberConversion = leadsReceived > 0 ? (convertedLeads / leadsReceived) * 100 : 0;
    
    const totalLTV = data.reduce((sum, lead) => sum + (lead.ltv || 0), 0);
    const avgLTV = leadsReceived > 0 ? totalLTV / leadsReceived : 0;
    
    const totalVisits = data.reduce((sum, lead) => sum + (lead.visits || 0), 0);
    const avgVisitsPerLead = leadsReceived > 0 ? totalVisits / leadsReceived : 0;
    
    // Pipeline health score based on multiple factors
    const pipelineHealth = Math.min(100, Math.round(
      (leadToTrialConversion * 0.3) + 
      (trialToMemberConversion * 0.4) + 
      (avgVisitsPerLead * 10 * 0.2) + 
      ((leadsReceived - proximityIssues) / leadsReceived * 100 * 0.1)
    ));

    return {
      leadsReceived,
      trialsCompleted,
      trialsScheduled,
      proximityIssues,
      convertedLeads,
      trialToMemberConversion,
      leadToTrialConversion,
      leadToMemberConversion,
      avgLTV,
      avgVisitsPerLead,
      pipelineHealth
    };
  }, [data]);

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle, 
    trend,
    format = 'number'
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
    trend?: number;
    format?: 'number' | 'currency' | 'percentage';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency': return formatCurrency(val);
        case 'percentage': return `${val.toFixed(1)}%`;
        default: return formatNumber(val);
      }
    };

    const getTrendColor = () => {
      if (trend === undefined) return '';
      return trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-600';
    };

    return (
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105",
        "bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg"
      )}>
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity duration-300 group-hover:opacity-10",
          color
        )} />
        
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                  color.replace('from-', 'bg-').replace('-400', '-100').split(' ')[0],
                  color.replace('to-', 'text-').replace('-600', '-600').split(' ')[1]
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-600 leading-tight">{title}</h3>
                  {subtitle && (
                    <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className={cn(
                  "text-3xl font-bold transition-all duration-300 group-hover:scale-105",
                  color.replace('to-', 'text-').replace('-600', '-700').split(' ')[1]
                )}>
                  {formatValue(value)}
                </div>
                
                {trend !== undefined && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className={cn("w-3 h-3", getTrendColor())} />
                    <span className={cn("text-xs font-medium", getTrendColor())}>
                      {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500">vs last period</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Animated background element */}
          <div className={cn(
            "absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-5 transition-all duration-500 group-hover:scale-125",
            color.replace('from-', 'bg-').replace('-400', '-200').split(' ')[0]
          )} />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Leads Received"
          value={metrics.leadsReceived}
          icon={Users}
          color="from-blue-400 to-blue-600"
          subtitle="Total incoming leads"
        />
        
        <MetricCard
          title="Trials Completed"
          value={metrics.trialsCompleted}
          icon={CheckCircle}
          color="from-green-400 to-green-600"
          subtitle="Successful trial sessions"
        />
        
        <MetricCard
          title="Trials Scheduled"
          value={metrics.trialsScheduled}
          icon={Calendar}
          color="from-purple-400 to-purple-600"
          subtitle="Scheduled trial sessions"
        />
        
        <MetricCard
          title="Proximity Issues"
          value={metrics.proximityIssues}
          icon={MapPin}
          color="from-red-400 to-red-600"
          subtitle="Location-related concerns"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Converted Leads"
          value={metrics.convertedLeads}
          icon={Target}
          color="from-emerald-400 to-emerald-600"
          subtitle="Successfully converted"
        />
        
        <MetricCard
          title="Trial → Member Rate"
          value={metrics.trialToMemberConversion}
          icon={TrendingUp}
          color="from-cyan-400 to-cyan-600"
          subtitle="Trial conversion efficiency"
          format="percentage"
        />
        
        <MetricCard
          title="Lead → Trial Rate"
          value={metrics.leadToTrialConversion}
          icon={Activity}
          color="from-indigo-400 to-indigo-600"
          subtitle="Lead engagement rate"
          format="percentage"
        />
        
        <MetricCard
          title="Lead → Member Rate"
          value={metrics.leadToMemberConversion}
          icon={Zap}
          color="from-yellow-400 to-yellow-600"
          subtitle="Overall conversion rate"
          format="percentage"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Average LTV"
          value={metrics.avgLTV}
          icon={DollarSign}
          color="from-green-400 to-green-600"
          subtitle="Lifetime value per lead"
          format="currency"
        />
        
        <MetricCard
          title="Avg Visits/Lead"
          value={metrics.avgVisitsPerLead}
          icon={Eye}
          color="from-orange-400 to-orange-600"
          subtitle="Engagement frequency"
        />
        
        <MetricCard
          title="Pipeline Health"
          value={metrics.pipelineHealth}
          icon={metrics.pipelineHealth >= 70 ? CheckCircle : metrics.pipelineHealth >= 50 ? Clock : AlertTriangle}
          color={
            metrics.pipelineHealth >= 70 
              ? "from-green-400 to-green-600"
              : metrics.pipelineHealth >= 50 
              ? "from-yellow-400 to-yellow-600"
              : "from-red-400 to-red-600"
          }
          subtitle="Overall funnel performance"
          format="percentage"
        />
      </div>

      <style>{`
        @keyframes metric-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .group:hover .animate-metric-pulse {
          animation: metric-pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};
