// Demo data for coaches at Cedars Sport Academy

export interface Coach {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  sport: string;
  image: string;
  bio: string;
  bioAr: string;
  experience: number; // years
  certifications: string[];
  achievements: string[];
  social: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  featured: boolean;
}

export const coaches: Coach[] = [
  {
    id: "1",
    name: "Karim Mansour",
    nameAr: "كريم منصور",
    role: "Head Football Coach",
    roleAr: "المدرب الرئيسي لكرة القدم",
    sport: "Football",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Former Lebanese national team player with 15 years of professional coaching experience. UEFA Pro License holder who has trained over 500 young athletes and led Cedars FC to 3 national championships.",
    bioAr: "لاعب سابق في المنتخب اللبناني مع 15 عاماً من الخبرة في التدريب الاحترافي. حامل رخصة UEFA Pro الذي درّب أكثر من 500 رياضي شاب وقاد نادي سيدرز إلى 3 بطولات وطنية.",
    experience: 15,
    certifications: ["UEFA Pro License", "FIFA Coaching Certificate", "Sports Science Degree"],
    achievements: [
      "3x Lebanese League Champion",
      "Best Coach Award 2021",
      "Trained 12 national team players",
    ],
    social: {
      instagram: "#",
      twitter: "#",
      linkedin: "#",
    },
    featured: true,
  },
  {
    id: "2",
    name: "Rania Haddad",
    nameAr: "رانيا حداد",
    role: "Basketball Head Coach",
    roleAr: "المدربة الرئيسية لكرة السلة",
    sport: "Basketball",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "FIBA Level 3 certified coach and former professional player in the Lebanese Women's Basketball League. Passionate about developing young talent and building championship-winning teams.",
    bioAr: "مدربة معتمدة من FIBA المستوى 3 ولاعبة محترفة سابقة في دوري كرة السلة النسائي اللبناني. شغوفة بتطوير المواهب الشابة وبناء فرق بطولية.",
    experience: 10,
    certifications: ["FIBA Level 3 Coach", "Sports Psychology Certificate", "First Aid Certified"],
    achievements: [
      "2x Women's League Champion",
      "Youth Development Award 2022",
      "100+ players trained",
    ],
    social: {
      instagram: "#",
      linkedin: "#",
    },
    featured: true,
  },
  {
    id: "3",
    name: "Lara Khoury",
    nameAr: "لارا خوري",
    role: "Head Swimming Coach",
    roleAr: "المدربة الرئيسية للسباحة",
    sport: "Swimming",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    bio: "Olympic-level swimmer turned coach with 12 years of experience. Lara represented Lebanon in the 2012 Mediterranean Games and holds multiple national records in freestyle and butterfly.",
    bioAr: "سباحة على المستوى الأولمبي تحولت إلى مدربة مع 12 عاماً من الخبرة. مثّلت لبنان في ألعاب البحر الأبيض المتوسط 2012 وتحمل أرقاماً قياسية وطنية متعددة.",
    experience: 12,
    certifications: ["FINA Coaching License", "Lifeguard Instructor", "Sports Nutrition Diploma"],
    achievements: [
      "Mediterranean Games Participant 2012",
      "5x National Record Holder",
      "Best Swimming Coach Lebanon 2020",
    ],
    social: {
      instagram: "#",
      twitter: "#",
    },
    featured: true,
  },
  {
    id: "4",
    name: "Omar Fakih",
    nameAr: "عمر فقيه",
    role: "Martial Arts Sensei",
    roleAr: "أستاذ فنون القتال",
    sport: "Martial Arts",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    bio: "5th Dan Black Belt in Karate and 3rd Dan in Judo. Omar has competed internationally and brings 18 years of teaching experience, focusing on discipline, respect, and technical excellence.",
    bioAr: "حزام أسود الدرجة الخامسة في الكاراتيه والدرجة الثالثة في الجودو. شارك عمر في منافسات دولية ويجلب 18 عاماً من خبرة التدريس مع التركيز على الانضباط والاحترام والتميز التقني.",
    experience: 18,
    certifications: ["5th Dan Karate Black Belt", "3rd Dan Judo", "WKF Certified Coach"],
    achievements: [
      "Arab Karate Champion 2015",
      "International Referee License",
      "300+ black belts awarded",
    ],
    social: {
      instagram: "#",
      linkedin: "#",
    },
    featured: true,
  },
  {
    id: "5",
    name: "Nadia Saleh",
    nameAr: "نادية صالح",
    role: "Tennis Head Coach",
    roleAr: "المدربة الرئيسية للتنس",
    sport: "Tennis",
    image: "https://randomuser.me/api/portraits/women/55.jpg",
    bio: "ITF certified tennis coach and former WTA ranked player. Nadia brings world-class coaching methodology to Cedars, having trained players who have competed at ITF Junior level internationally.",
    bioAr: "مدربة تنس معتمدة من ITF ولاعبة سابقة مصنفة في WTA. تجلب نادية منهجية تدريب عالمية المستوى إلى سيدرز، وقد دربت لاعبين شاركوا في مستوى ITF الشباب دولياً.",
    experience: 9,
    certifications: ["ITF Level 3 Coach", "Tennis Performance Specialist", "Sports Biomechanics"],
    achievements: [
      "Former WTA Ranked Player",
      "Trained 3 ITF Junior players",
      "Lebanese Tennis Federation Award",
    ],
    social: {
      instagram: "#",
      twitter: "#",
      linkedin: "#",
    },
    featured: false,
  },
  {
    id: "6",
    name: "Maya Rizk",
    nameAr: "مايا رزق",
    role: "Gymnastics Head Coach",
    roleAr: "المدربة الرئيسية للجمباز",
    sport: "Gymnastics",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    bio: "FIG certified gymnastics coach and former national team gymnast. Maya specializes in artistic and rhythmic gymnastics, creating a safe and encouraging environment for young athletes to thrive.",
    bioAr: "مدربة جمباز معتمدة من FIG وجمبازية سابقة في المنتخب الوطني. تتخصص مايا في الجمباز الفني والإيقاعي، وتخلق بيئة آمنة ومشجعة للرياضيين الشباب للتألق.",
    experience: 11,
    certifications: ["FIG Brevet Coach", "Rhythmic Gymnastics Specialist", "Child Development Certificate"],
    achievements: [
      "National Gymnastics Champion 2010",
      "Trained 5 national team members",
      "Youth Coach of the Year 2023",
    ],
    social: {
      instagram: "#",
    },
    featured: false,
  },
];

export const featuredCoaches = coaches.filter((c) => c.featured);
