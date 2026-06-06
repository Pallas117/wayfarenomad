export interface EventTicket {
  id: string;
  title: string;
  host: string;
  venue: string;
  city: string;
  day: string;
  month: string;
  time: string;
  category: string;
  seatsLeft: number;
}

export const mockTickets: EventTicket[] = [
  { id: "t1", title: "Morning Run Club", host: "Nomads PT", venue: "Belém Pier", city: "Lisbon", day: "12", month: "JUN", time: "07:00", category: "Fitness", seatsLeft: 9 },
  { id: "t2", title: "Friday Long-Table Dinner", host: "Camille", venue: "Bar das Flores", city: "Lisbon", day: "14", month: "JUN", time: "20:00", category: "Social", seatsLeft: 3 },
  { id: "t3", title: "Founders Coworking Day", host: "The Hub", venue: "Selina Secret Garden", city: "Lisbon", day: "17", month: "JUN", time: "09:30", category: "Work", seatsLeft: 22 },
  { id: "t4", title: "Sunset Surf — Carcavelos", host: "Diego", venue: "Praia de Carcavelos", city: "Cascais", day: "19", month: "JUN", time: "17:30", category: "Adventure", seatsLeft: 6 },
  { id: "t5", title: "Vinyl Night — analog only", host: "Roo", venue: "Damas", city: "Lisbon", day: "22", month: "JUN", time: "22:00", category: "Nightlife", seatsLeft: 40 },
];