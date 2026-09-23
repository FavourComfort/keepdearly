export type Tone = "primary" | "secondary" | "tertiary" | "neutral";

export type Person = {
  id: string;
  name: string;
  initial: string;
  tone: Tone;
  relationship?: string | undefined;
  birthday?: string | undefined;
  birthdayIn?: string | undefined;
  headline: string;
  likes: string[];
  dislikes: string[];
  giftIdeas: { title: string; note: string; icon: string; tone: Tone }[];
  hasActiveReminder?: boolean | undefined;
};

export type Memory = {
  id: string;
  personId?: string | undefined;
  personLabel?: string | undefined;
  topic?: string | undefined;
  text: string;
  when: string;
  footnote?: string | undefined;
  footnoteIcon?: string | undefined;
  tone: Tone;
};

export type Reminder = {
  id: string;
  title: string;
  personId?: string | undefined;
  personLabel?: string | undefined;
  date: string;
  timing: string;
  bucket: "today" | "week" | "upcoming";
  note: string;
  tone: Tone;
  meta?: string | undefined;
};

export const people: Person[] = [
  {
    id: "sarah",
    name: "Sarah",
    initial: "S",
    tone: "primary",
    relationship: "tender friend",
    birthday: "October 4",
    birthdayIn: "in 12 days",
    headline: "Loves vanilla perfume",
    hasActiveReminder: true,
    likes: [
      "Vanilla perfume",
      "Strawberry cheesecake",
      "Pastel colors",
      "Ceramic mugs",
      "Handwritten notes",
    ],
    dislikes: ["Very spicy food", "Loud crowded bars", "Synthetics"],
    giftIdeas: [
      { title: "Vanilla perfume", note: "Diptyque or Le Labo note", icon: "spa", tone: "primary" },
      {
        title: "Small gold hoop earrings",
        note: "Minimalist brushed finish",
        icon: "flare",
        tone: "tertiary",
      },
      {
        title: "French press / loose leaf",
        note: "Green tea blend she prefers",
        icon: "coffee",
        tone: "secondary",
      },
    ],
  },
  {
    id: "mum",
    name: "Mum",
    initial: "M",
    tone: "tertiary",
    relationship: "always home",
    birthday: "November 18",
    birthdayIn: "in 6 weeks",
    headline: "Wants a new handbag",
    hasActiveReminder: true,
    likes: ["Tan leather", "Sunday gardening", "Lemon cake", "Long phone calls"],
    dislikes: ["Fuss", "Surprise parties"],
    giftIdeas: [
      { title: "New handbag", note: "Tan leather, brass hardware", icon: "shopping_bag", tone: "tertiary" },
      { title: "Herb planter set", note: "For the kitchen window", icon: "potted_plant", tone: "secondary" },
    ],
  },
  {
    id: "daniel",
    name: "Daniel",
    initial: "D",
    tone: "secondary",
    relationship: "old friend",
    birthday: "March 2",
    birthdayIn: "in 5 months",
    headline: "Football & black coffee",
    likes: ["Black coffee", "Sunday football", "Running shoes"],
    dislikes: ["Sweet cocktails"],
    giftIdeas: [
      { title: "Good espresso beans", note: "Single origin, dark roast", icon: "coffee", tone: "primary" },
    ],
  },
  {
    id: "julian",
    name: "Julian",
    initial: "J",
    tone: "neutral",
    relationship: "neighbour",
    headline: "Prefers tea over coffee",
    likes: ["Earl grey", "Old paperbacks"],
    dislikes: [],
    giftIdeas: [{ title: "Loose leaf sampler", note: "Something floral", icon: "local_cafe", tone: "secondary" }],
  },
];

export const memories: Memory[] = [
  {
    id: "m1",
    personId: "sarah",
    personLabel: "Sarah",
    topic: "favorite treats & scents",
    text: "Sarah loves vanilla perfume. She stopped right by the apothecary window and specifically admired the Madagascar bean bottle.",
    when: "2 days ago",
    footnote: "Noted after afternoon tea",
    tone: "primary",
  },
  {
    id: "m2",
    personId: "mum",
    personLabel: "Mum",
    topic: "wishlist & style",
    text: "Mum mentioned she wants a new handbag in tan leather — something with sturdy brass hardware and soft handles for weekend walks.",
    when: "Sep 18",
    footnote: "Linked to anniversary",
    footnoteIcon: "check_circle",
    tone: "tertiary",
  },
  {
    id: "m3",
    personLabel: "Personal Note",
    topic: "little discoveries",
    text: "Found a cozy bakery with real sourdough on 4th Ave. The morning baker puts small cinnamon swirls aside right at 7:30 AM.",
    when: "Sep 12",
    footnote: "4th Ave Bakery corner",
    footnoteIcon: "place",
    tone: "neutral",
  },
  {
    id: "m4",
    personId: "sarah",
    personLabel: "Sarah",
    text: "Mentioned she wants to visit Zanzibar next spring.",
    when: "Added Aug 14",
    tone: "primary",
  },
  {
    id: "m5",
    personId: "sarah",
    personLabel: "Sarah",
    text: "Started a new job in June as a junior architect.",
    when: "Added Jun 2",
    tone: "secondary",
  },
  {
    id: "m6",
    personId: "sarah",
    personLabel: "Sarah",
    text: "Loves cold foam on her oat latte.",
    when: "Added May 19",
    tone: "tertiary",
  },
  {
    id: "m7",
    personId: "mum",
    personLabel: "Mum",
    text: "Still talks about the olive leather tote she saw in town.",
    when: "Added Sep 1",
    tone: "tertiary",
  },
  {
    id: "m8",
    personId: "daniel",
    personLabel: "Daniel",
    text: "Has a portfolio review coming up — wish him luck.",
    when: "Added Sep 20",
    tone: "secondary",
  },
];

export const reminders: Reminder[] = [
  {
    id: "r1",
    title: "Daniel's job interview",
    personId: "daniel",
    personLabel: "Daniel",
    date: "Today",
    timing: "Today · 2:00 PM",
    bucket: "today",
    note: "Wish him luck on the portfolio review!",
    tone: "secondary",
    meta: "Notified this morning",
  },
  {
    id: "r2",
    title: "Sarah's birthday",
    personId: "sarah",
    personLabel: "Sarah",
    date: "October 4",
    timing: "October 4 · in 4 days",
    bucket: "week",
    note: "She loves vanilla perfume & strawberry cheesecake.",
    tone: "primary",
    meta: "Sarah's birthday is next week",
  },
  {
    id: "r3",
    title: "Mum's birthday",
    personId: "mum",
    personLabel: "Mum",
    date: "November 18",
    timing: "November 18 · in 6 weeks",
    bucket: "upcoming",
    note: "She's been wanting a new handbag in tan leather.",
    tone: "tertiary",
    meta: "Early gift thought",
  },
  {
    id: "r4",
    title: "Dad's retirement celebration",
    personLabel: "Dad",
    date: "December 10",
    timing: "December 10 · in 9 weeks",
    bucket: "upcoming",
    note: "Loves vintage jazz vinyls.",
    tone: "tertiary",
    meta: "Gathering planned",
  },
];

export const reminderOptions = [
  { id: "none", label: "No reminder", icon: "notifications_off" },
  { id: "1-week", label: "1 week before", icon: "schedule" },
  { id: "3-days", label: "3 days before", icon: "hourglass_empty" },
  { id: "1-day", label: "1 day before", icon: "wb_twilight" },
  { id: "date", label: "Choose date", icon: "calendar_month" },
  { id: "custom", label: "Custom", icon: "tune" },
];
