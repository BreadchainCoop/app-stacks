export interface SpooMePayload {
  long_url: string;
  block_bots: true;
  private_stats: false;
}

export interface ShortenRequestBody {
  long_url: string;
  check?: boolean;
}

export interface SpooMeResponse {
  short_url: string;
  alias: string;
  long_url: string;
}

export interface SpooMeUrlItem {
  alias: string;
  block_bots: boolean;
  created_at: string;
  expire_after: string | null;
  id: string;
  last_click: string | null;
  long_url: string;
  max_clicks: number | null;
  password_set: boolean;
  private_stats: boolean;
  status: string;
  total_clicks: number;
}

export interface SpooMeListResponse {
  hasNext: boolean;
  items: SpooMeUrlItem[];
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  total: number;
}

export interface CachedShortUrl {
  short_url: string;
  alias: string;
  long_url: string;
  cached_at: string;
}
