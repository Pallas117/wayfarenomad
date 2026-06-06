export interface BoardPost {
  id: string;
  title: string;
  body: string;
  author: string;
  tag: "Meetups" | "Wifi Spots" | "Housing" | "General Chaos";
  color: "yellow" | "pink" | "blue" | "green";
  tilt: number;
}

export const mockBoardPosts: BoardPost[] = [
  { id: "1", title: "Sunset coworking @ Roastery", body: "Pulling up at 16:00 with the laptop and a flat white. Long table by the window, BYO headphones.", author: "Mila — Berlin → Lisbon", tag: "Meetups", color: "yellow", tilt: -2.4 },
  { id: "2", title: "1Gbps fiber + AC = bliss", body: "Found a tiny café in Alfama with proper fiber and no surprise outages. DM for the pin.", author: "Theo", tag: "Wifi Spots", color: "blue", tilt: 1.6 },
  { id: "3", title: "Sublet — Sept", body: "Light-filled studio, 6 min to the metro. Leaving for Mexico City early Sept, looking for someone tidy & chill.", author: "Annika", tag: "Housing", color: "pink", tilt: -1.1 },
  { id: "4", title: "Anyone surfing tomorrow?", body: "Carcavelos 7am. Wagon space for 2 boards + 2 humans. Coffee on me on the way back.", author: "Diego", tag: "Meetups", color: "green", tilt: 2.2 },
  { id: "5", title: "PSA: that pastel place lies", body: "If you've seen 'THE BEST WIFI' sign on the corner — it caps at 4Mbps after 11am. You're welcome.", author: "Roo", tag: "General Chaos", color: "yellow", tilt: -2.8 },
  { id: "6", title: "Long-table dinner Friday", body: "Booked the back room of the wine bar on R. das Flores. 12 seats, BYO stories.", author: "Camille", tag: "Meetups", color: "pink", tilt: 1.2 },
  { id: "7", title: "Looking for room — Oct", body: "Two months, quiet, no parties promise. Will pay extra for a kettle that boils faster than the sunrise.", author: "Yuki", tag: "Housing", color: "blue", tilt: -1.8 },
  { id: "8", title: "Pizza + mechanical keyboards", body: "Niche meetup, niche people. Saturday, all welcome, bring your weirdest layout.", author: "Marco", tag: "General Chaos", color: "green", tilt: 0.8 },
];