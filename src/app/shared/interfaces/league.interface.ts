export interface League {
  _id?: string;
  name: string;
  category: string;
  logo?: string;
  userId?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  msg: string;
  data: T | null;
}
