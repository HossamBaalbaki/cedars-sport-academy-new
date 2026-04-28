// Demo data for Cedars Sport Academy locations across Lebanon

export interface Location {
  id: string;
  name: string;
  nameAr: string;
  address: string;
  addressAr: string;
  city: string;
  cityAr: string;
  image: string;
  mapUrl: string;
  coordinates: { lat: number; lng: number };
  facilities: string[];
  sports: string[];
  schedule: ScheduleDay[];
  isMain: boolean;
}

export interface ScheduleDay {
  day: string;
  dayAr: string;
  hours: string;
  sports: string[];
}

export const locations: Location[] = [
  {
    id: "1",
    name: "Cedars Academy — Al Rayyan Main Campus",
    nameAr: "أكاديمية سيدرز — الحرم الرئيسي الريان",
    address: "Doha , Qatar",
    addressAr: "الدوحة، قطر",
    city: "Al Rayyan",
    cityAr: "الريان",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    mapUrl: "https://maps.google.com/?q=Jounieh,Lebanon",
    coordinates: { lat: 33.9806, lng: 35.6178 },
    facilities: [
      "Olympic 50m Swimming Pool",
      "Full-size Football Pitch (FIFA standard)",
      "Indoor Basketball Court",
      "Gymnastics Hall",
      "Fitness & Conditioning Center",
      "Physiotherapy Room",
      "Cafeteria & Lounge",
      "Parking (200 spaces)",
    ],
    sports: ["Football", "Basketball", "Swimming", "Martial Arts", "Tennis", "Gymnastics"],
    schedule: [
      { day: "Monday", dayAr: "الاثنين", hours: "7:00 AM – 10:00 PM", sports: ["Football", "Swimming", "Martial Arts"] },
      { day: "Tuesday", dayAr: "الثلاثاء", hours: "7:00 AM – 10:00 PM", sports: ["Basketball", "Tennis", "Swimming"] },
      { day: "Wednesday", dayAr: "الأربعاء", hours: "7:00 AM – 10:00 PM", sports: ["Football", "Gymnastics", "Martial Arts"] },
      { day: "Thursday", dayAr: "الخميس", hours: "7:00 AM – 10:00 PM", sports: ["Basketball", "Tennis", "Swimming"] },
      { day: "Friday", dayAr: "الجمعة", hours: "7:00 AM – 9:00 PM", sports: ["Football", "Martial Arts", "Gymnastics"] },
      { day: "Saturday", dayAr: "السبت", hours: "8:00 AM – 8:00 PM", sports: ["All Sports"] },
      { day: "Sunday", dayAr: "الأحد", hours: "9:00 AM – 6:00 PM", sports: ["Swimming", "Tennis"] },
    ],
    isMain: true,
  },
  {
    id: "2",
    name: "Cedars Academy — Branch",
    nameAr: "أكاديمية سيدرز — فرع قطر",
    address: "Doha , Qatar",
    addressAr: "شارع البحر، الدوحة، قطر",
    city: "Doha",
    cityAr: "الدوحة",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    mapUrl: "https://maps.google.com/?q=Hamra,Beirut,Lebanon",
    coordinates: { lat: 33.8938, lng: 35.4784 },
    facilities: [
      "25m Swimming Pool",
      "Indoor Football Hall",
      "Basketball Court",
      "Martial Arts Studio",
      "Fitness Center",
      "Changing Rooms & Showers",
      "Parking (80 spaces)",
    ],
    sports: ["Football", "Basketball", "Swimming", "Martial Arts"],
    schedule: [
      { day: "Monday", dayAr: "الاثنين", hours: "8:00 AM – 9:00 PM", sports: ["Football", "Swimming"] },
      { day: "Tuesday", dayAr: "الثلاثاء", hours: "8:00 AM – 9:00 PM", sports: ["Basketball", "Martial Arts"] },
      { day: "Wednesday", dayAr: "الأربعاء", hours: "8:00 AM – 9:00 PM", sports: ["Football", "Swimming"] },
      { day: "Thursday", dayAr: "الخميس", hours: "8:00 AM – 9:00 PM", sports: ["Basketball", "Martial Arts"] },
      { day: "Friday", dayAr: "الجمعة", hours: "8:00 AM – 8:00 PM", sports: ["All Sports"] },
      { day: "Saturday", dayAr: "السبت", hours: "9:00 AM – 7:00 PM", sports: ["All Sports"] },
      { day: "Sunday", dayAr: "الأحد", hours: "Closed", sports: [] },
    ],
    isMain: false,
  },
  {
    id: "3",
    name: "Cedars Academy — Al Rayyan Branch",
    nameAr: "أكاديمية سيدرز — فرع الريان",
    address: "Doha , Qatar",
    addressAr: "الدوحة، قطر",
    city: "Al Rayyan",
    cityAr: "الريان",
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80",
    mapUrl: "https://maps.google.com/?q=Zahle,Lebanon",
    coordinates: { lat: 33.8469, lng: 35.9017 },
    facilities: [
      "Full-size Football Pitch",
      "Basketball Court",
      "Martial Arts Dojo",
      "Fitness Room",
      "Changing Rooms",
      "Parking (120 spaces)",
    ],
    sports: ["Football", "Basketball", "Martial Arts"],
    schedule: [
      { day: "Monday", dayAr: "الاثنين", hours: "9:00 AM – 8:00 PM", sports: ["Football", "Martial Arts"] },
      { day: "Tuesday", dayAr: "الثلاثاء", hours: "9:00 AM – 8:00 PM", sports: ["Basketball"] },
      { day: "Wednesday", dayAr: "الأربعاء", hours: "9:00 AM – 8:00 PM", sports: ["Football", "Martial Arts"] },
      { day: "Thursday", dayAr: "الخميس", hours: "9:00 AM – 8:00 PM", sports: ["Basketball"] },
      { day: "Friday", dayAr: "الجمعة", hours: "9:00 AM – 7:00 PM", sports: ["Football", "Basketball"] },
      { day: "Saturday", dayAr: "السبت", hours: "9:00 AM – 6:00 PM", sports: ["All Sports"] },
      { day: "Sunday", dayAr: "الأحد", hours: "Closed", sports: [] },
    ],
    isMain: false,
  },
];

export const mainLocation = locations.find((l) => l.isMain)!;
