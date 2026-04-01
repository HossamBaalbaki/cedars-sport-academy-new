// Demo news and announcements for Cedars Sport Academy

export interface NewsItem {
  id: string;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  content: string;
  contentAr: string;
  image: string;
  date: string;
  category: string;
  author: string;
  featured: boolean;
  slug: string;
}

export interface TickerItem {
  id: string;
  text: string;
  textAr: string;
  type: "news" | "event" | "achievement" | "announcement";
  link?: string;
}

export const newsItems: NewsItem[] = [
  {
    id: "1",
    slug: "u18-football-champions-2024",
    title: "U-18 Football Team Wins National Championship!",
    titleAr: "فريق كرة القدم تحت 18 عاماً يفوز بالبطولة الوطنية!",
    excerpt:
      "Our U-18 football team clinched the Lebanese National Championship for the third consecutive year with a stunning 3-1 victory in the final.",
    excerptAr:
      "فريق كرة القدم تحت 18 عاماً حصل على البطولة الوطنية اللبنانية للسنة الثالثة على التوالي بفوز مذهل 3-1 في النهائي.",
    content:
      "In a thrilling final held at the Camille Chamoun Sports City Stadium, our U-18 football team delivered a masterclass performance to defeat Sporting Club Beirut 3-1 and claim the national title for the third consecutive year. Goals from Rami Khalil (2) and Jad Nassar sealed the victory in front of a packed crowd of 8,000 supporters.",
    contentAr:
      "في نهائي مثير أقيم في مدينة كميل شمعون الرياضية، قدم فريق كرة القدم تحت 18 عاماً أداءً رائعاً للفوز على نادي سبورتينغ بيروت 3-1 والفوز باللقب الوطني للسنة الثالثة على التوالي.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    date: "2024-03-15",
    category: "Achievement",
    author: "Cedars Academy",
    featured: true,
  },
  {
    id: "2",
    slug: "summer-camp-registration-2024",
    title: "Summer Sports Camp 2024 — Registration Now Open!",
    titleAr: "مخيم الرياضة الصيفي 2024 — التسجيل مفتوح الآن!",
    excerpt:
      "Join our intensive 6-week summer sports camp running July–August 2024. Limited spots available across all 6 sports disciplines.",
    excerptAr:
      "انضم إلى مخيمنا الرياضي الصيفي المكثف لمدة 6 أسابيع من يوليو إلى أغسطس 2024. أماكن محدودة في جميع التخصصات الرياضية الستة.",
    content:
      "We are thrilled to announce that registration for our Summer Sports Camp 2024 is now officially open. Running from July 1st to August 15th, the camp offers intensive training in Football, Basketball, Swimming, Martial Arts, Tennis, and Gymnastics. Early bird discount of 20% available until May 31st.",
    contentAr:
      "يسعدنا الإعلان عن فتح التسجيل رسمياً لمخيم الرياضة الصيفي 2024. يمتد المخيم من 1 يوليو إلى 15 أغسطس ويقدم تدريباً مكثفاً في كرة القدم وكرة السلة والسباحة وفنون القتال والتنس والجمباز.",
    image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&q=80",
    date: "2024-04-01",
    category: "Announcement",
    author: "Cedars Academy",
    featured: true,
  },
  {
    id: "3",
    slug: "new-olympic-pool-opening",
    title: "New Olympic Swimming Pool Now Open",
    titleAr: "افتتاح مسبح أولمبي جديد",
    excerpt:
      "We are proud to unveil our brand new 50-meter Olympic-standard swimming pool at our Jounieh campus, equipped with state-of-the-art timing systems.",
    excerptAr:
      "نفخر بالكشف عن مسبحنا الأولمبي الجديد بطول 50 متراً في حرم جونية، المجهز بأنظمة توقيت متطورة.",
    content:
      "After 18 months of construction, Cedars Sport Academy is proud to open its brand new 50-meter Olympic-standard swimming pool at the Jounieh campus. The facility features 8 competition lanes, electronic timing systems, underwater cameras for technique analysis, and a separate warm-up pool.",
    contentAr:
      "بعد 18 شهراً من البناء، تفخر أكاديمية سيدرز الرياضية بافتتاح مسبحها الأولمبي الجديد بطول 50 متراً في حرم جونية.",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    date: "2024-02-20",
    category: "Facility",
    author: "Cedars Academy",
    featured: true,
  },
  {
    id: "4",
    slug: "arab-martial-arts-gold-2024",
    title: "3 Gold Medals at Arab Martial Arts Championship",
    titleAr: "3 ميداليات ذهبية في بطولة العرب لفنون القتال",
    excerpt:
      "Three Cedars athletes brought home gold medals from the Arab Regional Martial Arts Championship held in Amman, Jordan.",
    excerptAr:
      "ثلاثة رياضيين من سيدرز عادوا بميداليات ذهبية من بطولة العرب الإقليمية لفنون القتال المقامة في عمان، الأردن.",
    content:
      "Cedars Sport Academy is bursting with pride as three of our martial arts athletes — Tarek Moussa (Karate -60kg), Lina Azar (Taekwondo -49kg), and Hassan Diab (Judo -73kg) — all claimed gold medals at the Arab Regional Championship in Amman.",
    contentAr:
      "أكاديمية سيدرز الرياضية تفخر بثلاثة من رياضييها في فنون القتال الذين فازوا بالميداليات الذهبية في بطولة العرب الإقليمية في عمان.",
    image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80",
    date: "2024-01-28",
    category: "Achievement",
    author: "Cedars Academy",
    featured: false,
  },
];

// News ticker items shown in the scrolling banner on the homepage
export const tickerItems: TickerItem[] = [
  {
    id: "1",
    text: "🏆 U-18 Football Team wins National Championship for the 3rd consecutive year!",
    textAr: "🏆 فريق كرة القدم تحت 18 عاماً يفوز بالبطولة الوطنية للسنة الثالثة على التوالي!",
    type: "achievement",
  },
  {
    id: "2",
    text: "📢 Summer Sports Camp 2024 Registration NOW OPEN — Limited spots available!",
    textAr: "📢 تسجيل مخيم الرياضة الصيفي 2024 مفتوح الآن — أماكن محدودة!",
    type: "announcement",
  },
  {
    id: "3",
    text: "🏊 New Olympic 50m Pool now open at our Jounieh Campus!",
    textAr: "🏊 مسبح أولمبي جديد بطول 50 متراً مفتوح الآن في حرم جونية!",
    type: "news",
  },
  {
    id: "4",
    text: "🥇 3 Gold Medals at the Arab Martial Arts Championship in Amman!",
    textAr: "🥇 3 ميداليات ذهبية في بطولة العرب لفنون القتال في عمان!",
    type: "achievement",
  },
  {
    id: "5",
    text: "🎾 Tennis tryouts every Saturday 9AM — Register now!",
    textAr: "🎾 تجارب التنس كل سبت الساعة 9 صباحاً — سجل الآن!",
    type: "event",
  },
  {
    id: "6",
    text: "⭐ Cedars Sport Academy — Shaping Champions Since 2012",
    textAr: "⭐ أكاديمية سيدرز الرياضية — نصنع الأبطال منذ 2012",
    type: "announcement",
  },
];
