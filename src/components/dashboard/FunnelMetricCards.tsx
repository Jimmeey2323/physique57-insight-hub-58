
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Calendar, TrendingUp, TrendingDown, MapPin, DollarSign, Activity, CheckCircle, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FunnelMetricCardsProps {
  data: LeadsData[];
}

export const FunnelMetricCards: React.FC<FunnelMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    if (!data.length) return [];

    const totalLeads = data.length;
    const trialsCompleted = data.filter(lead => lead.stage === 'Trial Completed' || lead.trialStatus === 'Completed').length;
    const trialsScheduled = data.filter(lead => lead.stage?.includes('Trial') && lead.stage !== 'Trial Completed').length;
    const proximityIssues = data.filter(lead => lead.stage === 'Proximity Issues' || lead.remarks?.toLowerCase().includes('proximity')).length;
    const convertedLeads = data.filter(lead => lead.conversionStatus === 'Converted' || lead.status === 'Won').length;
    const totalLTV = data.reduce((sum, lead) => sum + (lead.ltv || 0), 0);
    const totalVisits = data.reduce((sum, lead) => sum + (lead.visits || 0), 0);
    
    const trialToMemberRate = trialsCompleted > 0 ? (convertedLeads / trialsCompleted) * 100 : 0;
    const leadToTrialRate = totalLeads > 0 ? (trialsCompleted / totalLeads) * 100 : 0;
    const leadToMemberRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const avgLTV = totalLeads > 0 ? totalLTV / totalLeads : 0;
    const avgVisitsPerLead = totalLeads > 0 ? totalVisits / totalLeads : 0;
    
    // Pipeline health calculation
    const activeLeads = data.filter(lead => !['Lost', 'Won', 'Inactive'].includes(lead.status || '')).length;
    const pipelineHealth = totalLeads > 0 ? (activeLeads / totalLeads) * 100 : 0;

    return [
      {
        title: 'Leads Received',
        value: formatNumber(totalLeads),
        icon: Users,
        color: 'blue',
        description: 'Total leads generated in the selected period',
        change: 12.5
      },
      {
        title: 'Trials Completed',
        value: formatNumber(trialsCompleted),
        icon: CheckCircle,
        color: 'green',
        description: 'Leads who completed their trial sessions',
        change: 8.3
      },
      {
        title: 'Trials Scheduled',
        value: formatNumber(trialsScheduled),
        icon: Calendar,
        color: 'orange',
        description: 'Leads with scheduled trial sessions',
        change: -2.1
      },
      {
        title: 'Proximity Issues',
        value: formatNumber(proximityIssues),
        icon: MapPin,
        color: 'red',
        description: 'Leads facing location/proximity challenges',
        change: -15.7
      },
      {
        title: 'Converted Leads',
        value: formatNumber(convertedLeads),
        icon: Target,
        color: 'emerald',
        description: 'Leads successfully converted to members',
        change: 18.2
      },
      {
        title: 'Trial → Member Rate',
        value: `${trialToMemberRate.toFixed(1)}%`,
        icon: TrendingUp,
        color: 'purple',
        description: 'Conversion rate from trial to membership',
        change: 5.4
      },
      {
        title: 'Lead → Trial Rate',
        value: `${leadToTrialRate.toFixed(1)}%`,
        icon: Activity,
        color: 'indigo',
        description: 'Conversion rate from lead to trial',
        change: 3.2
      },
      {
        title: 'Lead → Member Rate',
        value: `${leadToMemberRate.toFixed(1)}%`,
        icon: BarChart3,
        color: 'cyan',
        description: 'Overall conversion rate from lead to member',
        change: 7.8
      },
      {
        title: 'Average LTV',
        value: formatCurrency(avgLTV),
        icon: DollarSign,
        color: 'yellow',
        description: 'Average lifetime value per lead',
        change: 22.1
      },
      {
        title: 'Avg Visits/Lead',
        value: avgVisitsPerLead.toFixed(1),
        icon: Clock,
        color: 'pink',
        description: 'Average number of visits per lead',
        change: -1.3
      },
      {
        title: 'Pipeline Health',
        value: `${pipelineHealth.toFixed(1)}%`,
        icon: AlertTriangle,
        color: pipelineHealth > 70 ? 'green' : pipelineHealth > 50 ? 'yellow' : 'red',
        description: 'Percentage of active leads in pipeline',
        change: 4.6
      }
    ];
  }, [data]);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-100',
      green: 'from-green-500 to-green-600 text-green-100',
      orange: 'from-orange-500 to-orange-600 text-orange-100',
      red: 'from-red-500 to-red-600 text-red-100',
      emerald: 'from-emerald-500 to-emerald-600 text-emerald-100',
      purple: 'from-purple-500 to-purple-600 text-purple-100',
      indigo: 'from-indigo-500 to-indigo-600 text-indigo-100',
      cyan: 'from-cyan-500 to-cyan-600 text-cyan-100',
      yellow: 'from-yellow-500 to-yellow-600 text-yellow-100',
      pink: 'from-pink-500 to-pink-600 text-pink-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.change > 0;
        
        return (
          <Card 
            key={metric.title}
            className={cn(
              "group relative overflow-hidden transition-all duration-700 hover:shadow-2xl hover:scale-105 cursor-pointer",
              "bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
              getColorClasses(metric.color)
            )} />
            
            {/* Top border animation */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left",
              getColorClasses(metric.color)
            )} />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 mb-2 tracking-wide uppercase">
                    {metric.title}
                  </p>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-3xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                      {metric.value}
                    </span>
                    <Badge 
                      variant={isPositive ? "default" : "destructive"}
                      className={cn(
                        "text-xs font-bold px-2 py-1 transition-all duration-300",
                        isPositive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                      )}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {formatPercentage(metric.change)}
                    </Badge>
                  </div>
                </div>
                
                <div className={cn(
                  "p-3 rounded-full bg-gradient-to-r transition-all duration-300 group-hover:scale-110",
                  getColorClasses(metric.color)
                )}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="relative w-full bg-slate-200 rounded-full h-1.5 mb-3 overflow-hidden">
                <div 
                  className={cn(
                    "h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out",
                    getColorClasses(metric.color)
                  )}
                  style={{ 
                    width: `${Math.min(Math.abs(metric.change) * 5, 100)}%`,
                    transform: 'translateX(-100%)',
                    animation: 'slideIn 1.5s ease-out forwards'
                  }}
                />
              </div>
              
              {/* Description on hover */}
              <div className="overflow-hidden transition-all duration-300 group-hover:max-h-20 max-h-0">
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {metric.description}
                </p>
              </div>
              
              {/* Click indicator */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
