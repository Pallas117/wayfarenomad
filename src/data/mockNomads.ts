export interface Nomad {
  id: string;
  name: string;
  handle: string;
  initials: string;
  role: string;
  origin: string;
  arrived: string;
  active: boolean;
  stamps: string[];
  bio: string;
}

export const mockNomads: Nomad[] = [
  { id: "n1", name: "Mila Sørensen", handle: "@mila", initials: "MS", role: "Product Designer", origin: "Copenhagen", arrived: "3 days ago", active: true, stamps: ["DK", "DE", "PT", "MX", "JP"], bio: "Slow travel, fast WiFi." },
  { id: "n2", name: "Theo Martin", handle: "@theom", initials: "TM", role: "Backend Eng", origin: "Montréal", arrived: "1 week ago", active: true, stamps: ["CA", "FR", "PT", "TH"], bio: "Latency hunter. Knows the good cafés." },
  { id: "n3", name: "Annika Reuter", handle: "@anni", initials: "AR", role: "Illustrator", origin: "Vienna", arrived: "2 weeks ago", active: false, stamps: ["AT", "IT", "PT"], bio: "Trading ink for sunshine." },
  { id: "n4", name: "Diego Almeida", handle: "@diegoa", initials: "DA", role: "Surf Photographer", origin: "São Paulo", arrived: "1 month ago", active: true, stamps: ["BR", "PT", "ID", "AU"], bio: "Boards, beans, beats." },
  { id: "n5", name: "Yuki Tanaka", handle: "@yk", initials: "YT", role: "Indie Dev", origin: "Osaka", arrived: "Just landed", active: true, stamps: ["JP", "TW", "PT"], bio: "Ships small things weekly." },
  { id: "n6", name: "Camille Petit", handle: "@camp", initials: "CP", role: "Community Lead", origin: "Lyon", arrived: "5 days ago", active: false, stamps: ["FR", "ES", "PT", "MA"], bio: "Long tables, longer conversations." },
  { id: "n7", name: "Roo Patel", handle: "@roo", initials: "RP", role: "DJ / Writer", origin: "London", arrived: "2 days ago", active: true, stamps: ["UK", "DE", "PT", "IN"], bio: "Crate digging on the road." },
  { id: "n8", name: "Marco Silva", handle: "@msv", initials: "MS", role: "Mech Keyboard Nerd", origin: "Porto", arrived: "Local", active: true, stamps: ["PT", "ES", "JP"], bio: "Switches, snacks, side projects." },
];