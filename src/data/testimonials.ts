// Demo testimonials from parents and athletes

export interface Testimonial {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  image: string;
  quote: string;
  quoteAr: string;
  rating: number;
  sport: string;
  featured: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Georges Nassar",
    nameAr: "جورج نصار",
    role: "Parent of Football Player",
    roleAr: "والد لاعب كرة قدم",
    image: "https://randomuser.me/api/portraits/men/41.jpg",
    quote:
      "Cedars Sport Academy transformed my son's life. In just one year, he went from a shy kid to a confident team leader. Coach  dedication is unmatched. Highly recommend to every parent in Lebanon!",
    quoteAr:
      "أكاديمية سيدرز الرياضية غيّرت حياة ابني. في عام واحد فقط، تحول من طفل خجول إلى قائد فريق واثق. تفاني المدرب كريم لا مثيل له. أوصي به بشدة لكل والد في لبنان!",
    rating: 5,
    sport: "Football",
    featured: true,
  },
  {
    id: "2",
    name: "Mireille Abi Nader",
    nameAr: "ميريل أبي نادر",
    role: "Parent of Gymnast",
    roleAr: "والدة لاعبة جمباز",
    image: "https://randomuser.me/api/portraits/women/62.jpg",
    quote:
      "My daughter has been training with Cedars for 3 years. The progress is incredible — she won her first national medal last year! The academy's facilities are world-class and the staff truly cares.",
    quoteAr:
      "ابنتي تتدرب مع المدربة مايا منذ 3 سنوات. التقدم مذهل — فازت بأول ميدالية وطنية لها العام الماضي! مرافق الأكاديمية عالمية المستوى والطاقم يهتم حقاً.",
    rating: 5,
    sport: "Gymnastics",
    featured: true,
  },
  {
    id: "3",
    name: "Ali Berri",
    nameAr: "علي بري",
    role: "Basketball Athlete, Age 17",
    roleAr: "لاعب كرة سلة، عمر 17",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    quote:
      "I joined Cedars two years ago with zero basketball experience. Now I'm on the national youth team! The coaches here push you to be your best every single day. This place is special.",
    quoteAr:
      "انضممت إلى سيدرز منذ عامين بدون أي خبرة في كرة السلة. الآن أنا في المنتخب الوطني للشباب! المدربون هنا يدفعونك لتكون في أفضل حالاتك كل يوم. هذا المكان مميز.",
    rating: 5,
    sport: "Basketball",
    featured: true,
  },
  {
    id: "4",
    name: "Joelle Karam",
    nameAr: "جويل كرم",
    role: "Parent of Swimmer",
    roleAr: "والدة سباحة",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    quote:
      "Coach Ayoujb is exceptional. She identified my daughter's potential early and developed a personalized training plan. The pool facilities are pristine and the safety standards are top-notch.",
    quoteAr:
      "المدربة لارا استثنائية. حددت إمكانات ابنتي مبكراً ووضعت خطة تدريب شخصية. مرافق المسبح نظيفة ومعايير السلامة من الدرجة الأولى.",
    rating: 5,
    sport: "Swimming",
    featured: true,
  },
  

];

export const featuredTestimonials = testimonials.filter((t) => t.featured);
