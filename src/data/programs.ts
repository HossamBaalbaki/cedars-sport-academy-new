// Demo data for sports programs offered by Cedars Sport Academy

export interface Program {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  image: string;
  ageGroup: string;
  duration: string;
  level: string;
  price: number;
  currency: string;
  features: string[];
  schedule: string;
  coach: string;
  maxStudents: number;
  enrolled: number;
  category: string;
}

export const programs: Program[] = [
  {
    id: "1",
    slug: "football",
    name: "Football",
    nameAr: "كرة القدم",
    description:
      "Professional football training for all ages. Develop your skills in dribbling, passing, shooting, and tactical awareness under the guidance of UEFA-certified coaches.",
    descriptionAr:
      "تدريب كرة قدم احترافي لجميع الأعمار. طور مهاراتك في المراوغة والتمرير والتسديد والوعي التكتيكي تحت إشراف مدربين معتمدين من UEFA.",
    icon: "⚽",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    ageGroup: "6–18 years",
    duration: "90 min/session",
    level: "All Levels",
    price: 150,
    currency: "USD",
    features: [
      "UEFA certified coaches",
      "Video analysis sessions",
      "Fitness & conditioning",
      "Match play & tournaments",
      "Nutrition guidance",
    ],
    schedule: "Mon, Wed, Fri",
    coach: "Coach Karim Mansour",
    maxStudents: 20,
    enrolled: 18,
    category: "Team Sports",
  },
  {
    id: "2",
    slug: "basketball",
    name: "Basketball",
    nameAr: "كرة السلة",
    description:
      "Master the fundamentals of basketball — dribbling, shooting, defense, and teamwork. Our program builds champions on and off the court.",
    descriptionAr:
      "أتقن أساسيات كرة السلة — المراوغة والتسديد والدفاع والعمل الجماعي. برنامجنا يبني أبطالاً داخل الملعب وخارجه.",
    icon: "🏀",
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80",
    ageGroup: "8–20 years",
    duration: "90 min/session",
    level: "Beginner to Advanced",
    price: 140,
    currency: "USD",
    features: [
      "FIBA certified coaches",
      "Individual skill drills",
      "Team strategy sessions",
      "Scrimmage games",
      "Mental performance coaching",
    ],
    schedule: "Tue, Thu, Sat",
    coach: "Coach Rania Haddad",
    maxStudents: 15,
    enrolled: 13,
    category: "Team Sports",
  },
  {
    id: "3",
    slug: "swimming",
    name: "Swimming",
    nameAr: "السباحة",
    description:
      "From beginner strokes to competitive racing, our Olympic-size pool and certified instructors ensure safe, progressive swimming development.",
    descriptionAr:
      "من الحركات الأساسية للمبتدئين إلى السباقات التنافسية، يضمن مسبحنا الأولمبي ومدربونا المعتمدون تطوراً آمناً ومتدرجاً في السباحة.",
    icon: "🏊",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    ageGroup: "4–25 years",
    duration: "60 min/session",
    level: "All Levels",
    price: 120,
    currency: "USD",
    features: [
      "Olympic-size pool",
      "Certified lifeguards",
      "All 4 strokes training",
      "Competitive swim team",
      "Water safety education",
    ],
    schedule: "Daily",
    coach: "Coach Lara Khoury",
    maxStudents: 12,
    enrolled: 10,
    category: "Individual Sports",
  },
  {
    id: "4",
    slug: "martial-arts",
    name: "Martial Arts",
    nameAr: "فنون القتال",
    description:
      "Build discipline, confidence, and self-defense skills through our comprehensive martial arts program covering Karate, Taekwondo, and Judo.",
    descriptionAr:
      "بناء الانضباط والثقة ومهارات الدفاع عن النفس من خلال برنامج فنون القتال الشامل الذي يغطي الكاراتيه والتايكواندو والجودو.",
    icon: "🥋",
    image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80",
    ageGroup: "5–30 years",
    duration: "75 min/session",
    level: "All Levels",
    price: 130,
    currency: "USD",
    features: [
      "Black belt instructors",
      "Belt grading system",
      "Self-defense techniques",
      "Competition preparation",
      "Character development",
    ],
    schedule: "Mon, Wed, Sat",
    coach: "Sensei Omar Fakih",
    maxStudents: 18,
    enrolled: 16,
    category: "Individual Sports",
  },
  {
    id: "5",
    slug: "tennis",
    name: "Tennis",
    nameAr: "التنس",
    description:
      "Learn tennis from the ground up or refine your competitive game. Our clay and hard courts with professional coaching will elevate your performance.",
    descriptionAr:
      "تعلم التنس من الصفر أو صقل لعبتك التنافسية. ملاعبنا الترابية والصلبة مع التدريب الاحترافي ستعزز أداءك.",
    icon: "🎾",
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
    ageGroup: "7–40 years",
    duration: "60 min/session",
    level: "Beginner to Pro",
    price: 160,
    currency: "USD",
    features: [
      "ITF certified coaches",
      "Video swing analysis",
      "Clay & hard courts",
      "Tournament preparation",
      "Private & group sessions",
    ],
    schedule: "Tue, Thu, Sat, Sun",
    coach: "Coach Nadia Saleh",
    maxStudents: 8,
    enrolled: 7,
    category: "Individual Sports",
  },
  {
    id: "6",
    slug: "gymnastics",
    name: "Gymnastics",
    nameAr: "الجمباز",
    description:
      "Develop flexibility, strength, coordination, and grace through artistic and rhythmic gymnastics programs for children and teens.",
    descriptionAr:
      "تطوير المرونة والقوة والتنسيق والرشاقة من خلال برامج الجمباز الفني والإيقاعي للأطفال والمراهقين.",
    icon: "🤸",
    image: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=800&q=80",
    ageGroup: "4–16 years",
    duration: "90 min/session",
    level: "Beginner to Competitive",
    price: 145,
    currency: "USD",
    features: [
      "FIG certified coaches",
      "Professional equipment",
      "Artistic & rhythmic tracks",
      "Competition team",
      "Flexibility & conditioning",
    ],
    schedule: "Mon, Wed, Fri, Sat",
    coach: "Coach Maya Rizk",
    maxStudents: 14,
    enrolled: 12,
    category: "Individual Sports",
  },
];

export const programCategories = ["All", "Team Sports", "Individual Sports"];
