export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: "hangout" | "event" | "beacon" | "resource";
  category?: string;
}
