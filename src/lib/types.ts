export interface FuelPriceRecord {
  country: string;
  year: string;
  month: string;
  calendarDay: string;
  product: 'Petrol' | 'Diesel' | string;
  city: 'Delhi' | 'Mumbai' | 'Chennai' | 'Kolkata' | string;
  rsp: number;
}
