// Demo data for academy achievements and trophies

export interface Achievement {
  id: string;
  title: string;
  titleAr: string;
  year: number;
  description: string;
  descriptionAr: string;
  icon: string;
  category: string;
}

export interface Stat {
  id: string;
  label: string;
  labelAr: string;
  value: number;
  suffix: string;
  icon: string;
  color: string;
}

export const achievements: Achievement[] = [
  {
    id: "1",
    title: "Lebanese Football League Champions",
    titleAr: "أبطال الدوري اللبناني لكرة القدم",
    year: 2023,
    description: "Our U-18 football team claimed the national championship title for the third consecutive year.",
    descriptionAr: "فريق كرة القدم تحت 18 عاماً حصل على لقب البطولة الوطنية للسنة الثالثة على التوالي.",
    icon: "🏆",
    category: "Football",
  },
  {
    id: "2",
    title: "Arab Martial Arts Championship Gold",
    titleAr: "ذهبية بطولة العرب لفنون القتال",
    year: 2023,
    description: "Three of our martial arts athletes won gold medals at the Arab Regional Championship in Amman.",
    descriptionAr: "ثلاثة من رياضيينا في فنون القتال فازوا بميداليات ذهبية في البطولة الإقليمية العربية في عمان.",
    icon: "🥇",
    category: "Martial Arts",
  },
  {
    id: "3",
    title: "Best Youth Academy Award",
    titleAr: "جائزة أفضل أكاديمية للشباب",
    year: 2022,
    description: "Recognized by the Lebanese Olympic Committee as the Best Youth Sports Academy in Lebanon.",
    descriptionAr: "تم الاعتراف بها من قبل اللجنة الأولمبية اللبنانية كأفضل أكاديمية رياضية للشباب في لبنان.",
    icon: "🏅",
    category: "Academy",
  },
  {
    id: "4",
    title: "Mediterranean Swimming Records",
    titleAr: "أرقام قياسية في سباحة البحر المتوسط",
    year: 2022,
    description: "Our swimmers broke 4 national records at the Mediterranean Youth Swimming Championships.",
    descriptionAr: "سباحونا كسروا 4 أرقام قياسية وطنية في بطولة البحر الأبيض المتوسط للسباحة الشبابية.",
    icon: "🏊",
    category: "Swimming",
  },
  {
    id: "5",
    title: "Basketball League Runners-Up",
    titleAr: "وصيف دوري كرة السلة",
    year: 2023,
    description: "Our U-16 basketball team reached the national finals, finishing as runners-up in a thrilling championship.",
    descriptionAr: "فريق كرة السلة تحت 16 عاماً وصل إلى النهائيات الوطنية وحل وصيفاً في بطولة مثيرة.",
    icon: "🏀",
    category: "Basketball",
  },
  {
    id: "6",
    title: "ITF Junior Tennis Qualifier",
    titleAr: "مؤهل تنس الشباب ITF",
    year: 2023,
    description: "Two of our tennis players qualified for the ITF Junior Circuit, representing Lebanon internationally.",
    descriptionAr: "اثنان من لاعبي التنس لدينا تأهلوا لدائرة ITF الشبابية، ممثلين لبنان دولياً.",
    icon: "🎾",
    category: "Tennis",
  },
  {
    id: "7",
    title: "National Gymnastics Gold Medals",
    titleAr: "ميداليات ذهبية في الجمباز الوطني",
    year: 2022,
    description: "Our gymnastics team won 6 gold medals at the Lebanese National Gymnastics Championship.",
    descriptionAr: "فريق الجمباز لدينا فاز بـ 6 ميداليات ذهبية في بطولة لبنان الوطنية للجمباز.",
    icon: "🤸",
    category: "Gymnastics",
  },
  {
    id: "8",
    title: "Community Impact Award",
    titleAr: "جائزة التأثير المجتمعي",
    year: 2021,
    description: "Awarded for our free sports programs serving underprivileged youth across 5 Lebanese regions.",
    descriptionAr: "تم منحها لبرامجنا الرياضية المجانية التي تخدم الشباب المحروم في 5 مناطق لبنانية.",
    icon: "❤️",
    category: "Community",
  },
];

export const stats: Stat[] = [
  {
    id: "1",
    label: "Athletes Trained",
    labelAr: "رياضي مدرب",
    value: 1200,
    suffix: "+",
    icon: "👥",
    color: "text-lebanon-green",
  },
  {
    id: "2",
    label: "Championships Won",
    labelAr: "بطولة فازت بها",
    value: 47,
    suffix: "",
    icon: "🏆",
    color: "text-yellow-400",
  },
  {
    id: "3",
    label: "Expert Coaches",
    labelAr: "مدرب خبير",
    value: 24,
    suffix: "",
    icon: "👨‍🏫",
    color: "text-lebanon-green",
  },
  {
    id: "4",
    label: "Years of Excellence",
    labelAr: "سنة من التميز",
    value: 12,
    suffix: "",
    icon: "⭐",
    color: "text-lebanon-red",
  },
  {
    id: "5",
    label: "Sports Programs",
    labelAr: "برنامج رياضي",
    value: 6,
    suffix: "",
    icon: "🎯",
    color: "text-blue-400",
  },
  {
    id: "6",
    label: "Locations",
    labelAr: "موقع",
    value: 3,
    suffix: "",
    icon: "📍",
    color: "text-purple-400",
  },
];
