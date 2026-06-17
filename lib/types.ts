export type TourStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'sold_out'
  | 'cancelled'
  | 'archived';

export type DestinationCategory =
  | 'waterfall'
  | 'peak'
  | 'lake'
  | 'canyon'
  | 'cave';

export type TourDifficulty = 'easy' | 'moderate' | 'hard' | 'extreme';

export interface ItineraryDay {
  day: number;
  title: string;
  body: string;
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  descriptionMd: string | null;
  region: string | null;
  locationTags: string[] | null;
  destinationCategories: DestinationCategory[] | null;
  difficulty: TourDifficulty | null;
  lengthKm: string | null;
  meetingPointDescription: string | null;
  meetingPointLat: string | null;
  meetingPointLng: string | null;
  itinerary: ItineraryDay[] | null;
  mediaUrls: string[] | null;
  gpxTrackUrl: string | null;
  includes: string[] | null;
  excludes: string[] | null;
}

export interface Tour {
  id: string;
  slug: string;
  placeId: string;
  orgId: string;
  title: string | null;
  descriptionMd: string | null;
  departureDate: string;
  returnDate: string;
  departureTz: string;
  priceAmount: string;
  discountAmount: string;
  finalPriceAmount: string;
  priceCurrency: string;
  seatsTotal: number;
  seatsAvailable: number;
  contactInfo: string | null;
  sourceMsgUrl: string | null;
  dates: { departureDate: string; returnDate: string }[] | null;
  status: TourStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  place?: Place;
}

export interface TourListResponse {
  items: Tour[];
  total: number;
  page: number;
  limit: number;
}

export interface PlaceListResponse {
  items: Place[];
  total: number;
  page: number;
  limit: number;
}

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive?: boolean;
}

export interface OrganizationWithTours extends Organization {
  tours: Tour[];
}

export interface Review {
  id: string;
  rating: number;
  body: string | null;
  photoUrls: string[];
  createdAt: string;
  author: { name: string };
}

export interface ReviewEligibility {
  canReview: boolean;
  finished: boolean;
  hasJoined: boolean;
  existingReviewId: string | null;
}

export interface UserPreferences {
  preferredCategories: DestinationCategory[];
  maxBudget: number;
  notifications: {
    priceChanged: boolean;
    seatsUpdated: boolean;
    tourCancelled: boolean;
    savedSearchAlerts: boolean;
  };
}
