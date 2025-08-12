
export interface ConversionRetentionData {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  firstVisitDate: string;
  firstVisitEntityName: string;
  firstVisitType: string;
  firstVisitLocation: string;
  paymentMethod: string;
  membershipUsed: string;
  homeLocation: string;
  classNo: number;
  trainerName: string;
  isNew: string;
  visitsPostTrial: number;
  membershipsBoughtPostTrial: string;
  purchaseCountPostTrial: number;
  ltv: number;
  retentionStatus: string;
  conversionStatus: string;
}

export interface ConversionRetentionFilters {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  homeLocation: string[];
  trainer: string[];
  paymentMethod: string[];
  retentionStatus: string[];
  conversionStatus: string[];
  isNew: string[];
  firstVisitType: string[];
  minLTV?: number;
  maxLTV?: number;
  minVisitsPostTrial?: number;
  maxVisitsPostTrial?: number;
}

export type ConversionMetricType = 
  | 'totalClients'
  | 'conversionRate'
  | 'retentionRate'
  | 'avgLTV'
  | 'totalRevenue'
  | 'avgVisitsPostTrial'
  | 'newClientRate'
  | 'avgConversionSpan';
