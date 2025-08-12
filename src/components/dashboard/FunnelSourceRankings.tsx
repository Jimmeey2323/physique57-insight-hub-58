
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown, Award, Target, DollarSign } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FunnelSourceRankingsProps {
  data: LeadsData[];
}

export const FunnelSourceRankings: React.FC<FunnelSourceRankingsProps> = ({ data }) => {
  const sourceRankings = useMemo(() => {
    if (!data.length) return { top: [], bottom: [] };

    const sourceStats = data.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = {
          name: source,
          totalLeads: 0,
          convertedLeads: 0,
          totalLTV: 0,
          totalVisits: 0,
          trialsCompleted: 0,
          trialsScheduled: 0
        };
      }
      
      acc[source].totalLeads += 1;
      if (lead.conversionStatus === 'Converted') acc[source].convertedLeads += 1;
      acc[source].totalLTV += lead.ltv || 0;
      acc[source].totalVisits += lead.visits || 0;
      if (lead.stage === 'Trial Completed') acc[source].trialsCompleted += 1;
      if (lead.stage?.includes('Trial')) acc[source].trialsScheduled += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const processedSources = Object.values(sourceStats)
      .map((source: any) => ({
        ...source,
        conversionRate: source.totalLeads > 0 ? (source.convertedLeads / source.totalLeads) * 100 : 0,
        avgLTV: source.totalLeads > 0 ? source.totalLTV / source.totalLeads : 0,
        avgVisits: source.totalLeads > 0 ? source.totalVisits / source.totalLeads : 0,
        trialCompletionRate: source.trialsScheduled > 0 ? (source.trialsCompleted / source.trialsScheduled) * 100 : 0
      }))
      .filter(source => source.totalLeads >= 3); // Filter out sources with very few leads

    const sortedByConversion = [...processedSources].sort((a, b) => b.conversionRate - a.conversionRate);
    const sortedByLTV = [...processedSources].sort((a, b) => b.avgLTV - a.avgLTV);
    const sortedByVolume = [...processedSources].sort((a, b) => b.totalLeads - a.totalLeads);

    return {
      top: sortedByConversion.slice(0, 5),
      bottom: sortedByConversion.slice(-3).reverse(),
      topLTV: sortedByLTV.slice(0, 3),
      topVolume: sortedByVolume.slice(0, 3)
    };
  }, [data]);

  const RankingItem = ({ source, rank, type }: { source: any; rank: number; type: 'top' | 'bottom' | 'ltv' | 'volume' }) => {
    const isTop = type === 'top' || type === 'ltv' || type === 'volume';
    const icon = rank === 1 ? Trophy : rank === 2 ? Award : Target;
    const IconComponent = icon;
    
    const getMetricValue = () => {
      switch (type) {
        case 'ltv':
          return formatCurrency(source.avgLTV);
        case 'volume':
          return formatNumber(source.totalLeads);
        default:
          return `${source.conversionRate.toFixed(1)}%`;
      }
    };

    const getMetricLabel = () => {
      switch (type) {
        case 'ltv':
          return 'Avg LTV';
        case 'volume':
          return 'Total Leads';
        default:
          return 'Conversion';
      }
    };

    return (
      <div 
        className={cn(
          "group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-lg",
          isTop ? "bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100" 
                : "bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100",
          "animate-fade-in border border-opacity-20",
          isTop ? "border-green-200" : "border-red-200"
        )}
        style={{ animationDelay: `${rank * 100}ms` }}
      >
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 group-hover:scale-110",
          isTop ? "bg-green-500 text-white" : "bg-red-500 text-white"
        )}>
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
            {source.name}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className={cn(
              "text-lg font-bold",
              isTop ? "text-green-600" : "text-red-600"
            )}>
              {getMetricValue()}
            </span>
            <span className="text-xs text-slate-500 uppercase tracking-wide">
              {getMetricLabel()}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-slate-600">
            {formatNumber(source.totalLeads)} leads
          </div>
          <Badge 
            variant={isTop ? "default" : "destructive"}
            className="mt-1 text-xs"
          >
            #{rank}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Trophy className="w-6 h-6 text-yellow-600 animate-pulse" />
          Source Performance Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Performers by Conversion */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-slate-800">Top Conversion Sources</h3>
          </div>
          <div className="space-y-3">
            {sourceRankings.top.map((source, index) => (
              <RankingItem 
                key={source.name} 
                source={source} 
                rank={index + 1} 
                type="top" 
              />
            ))}
          </div>
        </div>

        {/* Top by LTV */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Highest LTV Sources</h3>
          </div>
          <div className="space-y-3">
            {sourceRankings.topLTV.map((source, index) => (
              <RankingItem 
                key={`ltv-${source.name}`} 
                source={source} 
                rank={index + 1} 
                type="ltv" 
              />
            ))}
          </div>
        </div>

        {/* Bottom Performers */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-slate-800">Needs Improvement</h3>
          </div>
          <div className="space-y-3">
            {sourceRankings.bottom.map((source, index) => (
              <RankingItem 
                key={`bottom-${source.name}`} 
                source={source} 
                rank={index + 1} 
                type="bottom" 
              />
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-3">Performance Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Best Conversion Rate:</span>
              <div className="font-bold text-green-600">
                {sourceRankings.top[0]?.conversionRate.toFixed(1) || '0'}%
              </div>
            </div>
            <div>
              <span className="text-slate-600">Highest LTV Source:</span>
              <div className="font-bold text-blue-600">
                {sourceRankings.topLTV[0]?.name || 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Total Sources:</span>
              <div className="font-bold text-slate-800">
                {sourceRankings.top.length + sourceRankings.bottom.length}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Avg Conversion:</span>
              <div className="font-bold text-slate-800">
                {sourceRankings.top.length > 0 
                  ? (sourceRankings.top.reduce((sum, s) => sum + s.conversionRate, 0) / sourceRankings.top.length).toFixed(1)
                  : '0'
                }%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
