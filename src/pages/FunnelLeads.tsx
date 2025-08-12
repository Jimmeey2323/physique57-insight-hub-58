
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeadsData } from '@/hooks/useLeadsData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Filter, Database, Eye, BarChart3, TrendingUp, Users, Target, TrendingDown, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { cn } from '@/lib/utils';
import { LeadsFilterOptions, LeadsData } from '@/types/leads';
import { GlobalFiltersProvider } from '@/contexts/GlobalFiltersContext';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';
import { FunnelLeadsFilterSection } from '@/components/dashboard/FunnelLeadsFilterSection';
import { FunnelMetricCards } from '@/components/dashboard/FunnelMetricCards';
import { FunnelInteractiveCharts } from '@/components/dashboard/FunnelInteractiveCharts';
import { FunnelSourceRankings } from '@/components/dashboard/FunnelSourceRankings';
import { FunnelStageRankings } from '@/components/dashboard/FunnelStageRankings';
import { FunnelMonthOnMonthTable } from '@/components/dashboard/FunnelMonthOnMonthTable';
import { FunnelYearOnYearTable } from '@/components/dashboard/FunnelYearOnYearTable';
import { FunnelStagePerformanceTable } from '@/components/dashboard/FunnelStagePerformanceTable';
import { FunnelHealthMetricsTable } from '@/components/dashboard/FunnelHealthMetricsTable';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const FunnelLeads = () => {
  const navigate = useNavigate();
  const { data: leadsData, loading, error } = useLeadsData();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<LeadsFilterOptions>(() => {
    const previousMonth = getPreviousMonthDateRange();
    return {
      dateRange: previousMonth,
      location: [],
      source: [],
      stage: [],
      status: [],
      associate: [],
      channel: [],
      trialStatus: [],
      conversionStatus: [],
      retentionStatus: [],
      minLTV: undefined,
      maxLTV: undefined
    };
  });

  // Extract unique values for filters
  const uniqueValues = useMemo(() => {
    if (!leadsData) return {
      locations: [],
      sources: [],
      stages: [],
      statuses: [],
      associates: [],
      channels: [],
      trialStatuses: [],
      conversionStatuses: [],
      retentionStatuses: []
    };

    return {
      locations: [...new Set(leadsData.map(item => item.center).filter(Boolean))],
      sources: [...new Set(leadsData.map(item => item.source).filter(Boolean))],
      stages: [...new Set(leadsData.map(item => item.stage).filter(Boolean))],
      statuses: [...new Set(leadsData.map(item => item.status).filter(Boolean))],
      associates: [...new Set(leadsData.map(item => item.associate).filter(Boolean))],
      channels: [...new Set(leadsData.map(item => item.channel).filter(Boolean))],
      trialStatuses: [...new Set(leadsData.map(item => item.trialStatus).filter(Boolean))],
      conversionStatuses: [...new Set(leadsData.map(item => item.conversionStatus).filter(Boolean))],
      retentionStatuses: [...new Set(leadsData.map(item => item.retentionStatus).filter(Boolean))]
    };
  }, [leadsData]);

  // Filter leads data based on current filters
  const filteredLeadsData = useMemo(() => {
    if (!leadsData) return [];

    return leadsData.filter(lead => {
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const leadDate = new Date(lead.createdAt);
        if (filters.dateRange.start && leadDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && leadDate > new Date(filters.dateRange.end)) return false;
      }

      // Array filters
      if (filters.location.length > 0 && !filters.location.includes(lead.center)) return false;
      if (filters.source.length > 0 && !filters.source.includes(lead.source)) return false;
      if (filters.stage.length > 0 && !filters.stage.includes(lead.stage)) return false;
      if (filters.status.length > 0 && !filters.status.includes(lead.status)) return false;
      if (filters.associate.length > 0 && !filters.associate.includes(lead.associate)) return false;
      if (filters.channel.length > 0 && !filters.channel.includes(lead.channel)) return false;
      if (filters.trialStatus.length > 0 && !filters.trialStatus.includes(lead.trialStatus)) return false;
      if (filters.conversionStatus.length > 0 && !filters.conversionStatus.includes(lead.conversionStatus)) return false;
      if (filters.retentionStatus.length > 0 && !filters.retentionStatus.includes(lead.retentionStatus)) return false;

      // LTV range filter
      if (filters.minLTV !== undefined && lead.ltv < filters.minLTV) return false;
      if (filters.maxLTV !== undefined && lead.ltv > filters.maxLTV) return false;

      return true;
    });
  }, [leadsData, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading lead funnel analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <GlobalFiltersProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 text-white">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-10 w-24 h-24 bg-blue-300/20 rounded-full animate-bounce delay-1000"></div>
            <div className="absolute bottom-10 left-20 w-40 h-40 bg-indigo-300/10 rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-cyan-300/15 rounded-full animate-ping delay-700"></div>
          </div>
          
          <div className="relative px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8 animate-fade-in">
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-105"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
                
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <Database className="w-3 h-3 mr-1" />
                    Lead Analytics
                  </Badge>
                  <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Real-time Data
                  </Badge>
                </div>
              </div>
              
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 animate-fade-in-up shadow-lg">
                  <TrendingDown className="w-5 h-5" />
                  <span className="font-semibold">Advanced Lead Analytics</span>
                </div>
                
                <h1 className={cn(
                  "text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent",
                  "animate-fade-in-up delay-200 tracking-tight"
                )}>
                  Lead Performance Hub
                </h1>
                
                <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300 font-medium">
                  Comprehensive lead generation analysis with conversion tracking, funnel optimization, 
                  and performance insights across all channels and associates
                </p>
                
                {/* Enhanced Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 animate-fade-in-up delay-400 max-w-4xl mx-auto">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center mb-3">
                      <Users className="w-8 h-8 text-blue-200" />
                    </div>
                    <div className="text-2xl font-bold text-white">{filteredLeadsData.length}+</div>
                    <div className="text-sm text-blue-200">Total Leads</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center mb-3">
                      <Target className="w-8 h-8 text-green-200" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {filteredLeadsData.length > 0 
                        ? ((filteredLeadsData.filter(l => l.conversionStatus === 'Converted').length / filteredLeadsData.length) * 100).toFixed(1)
                        : '0.0'
                      }%
                    </div>
                    <div className="text-sm text-green-200">Conversion Rate</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center mb-3">
                      <TrendingUp className="w-8 h-8 text-amber-200" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      ₹{filteredLeadsData.length > 0 
                        ? Math.round(filteredLeadsData.reduce((sum, l) => sum + (l.ltv || 0), 0) / filteredLeadsData.length)
                        : 0
                      }
                    </div>
                    <div className="text-sm text-amber-200">Avg LTV</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center mb-3">
                      <Calendar className="w-8 h-8 text-purple-200" />
                    </div>
                    <div className="text-2xl font-bold text-white">{uniqueValues.sources.length}</div>
                    <div className="text-sm text-purple-200">Lead Sources</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Collapsible Filter Section */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Filter className="w-5 h-5 text-blue-600" />
                      Advanced Filters
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        {Object.values(filters).flat().filter(Boolean).length} Active
                      </Badge>
                      {filtersOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <FunnelLeadsFilterSection
                    filters={filters}
                    onFiltersChange={setFilters}
                    uniqueValues={uniqueValues}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Metric Cards */}
          <FunnelMetricCards data={filteredLeadsData} />

          {/* Interactive Charts */}
          <FunnelInteractiveCharts data={filteredLeadsData} />

          {/* Rankings Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FunnelSourceRankings data={filteredLeadsData} />
            <FunnelStageRankings data={filteredLeadsData} />
          </div>

          {/* Month on Month Table */}
          <FunnelMonthOnMonthTable data={filteredLeadsData} />

          {/* Year on Year Table */}
          <FunnelYearOnYearTable data={filteredLeadsData} />

          {/* Stage Performance and Health Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FunnelStagePerformanceTable data={filteredLeadsData} />
            <FunnelHealthMetricsTable data={filteredLeadsData} />
          </div>
        </div>
        
        <Footer />

        <style>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }
          
          .delay-200 {
            animation-delay: 0.2s;
          }
          
          .delay-300 {
            animation-delay: 0.3s;
          }
          
          .delay-400 {
            animation-delay: 0.4s;
          }
        `}</style>
      </div>
    </GlobalFiltersProvider>
  );
};

export default FunnelLeads;
