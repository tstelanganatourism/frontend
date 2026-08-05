'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Ship, 
  MapPin, 
  Phone, 
  History, 
  Award, 
  Users, 
  Navigation, 
  Search, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Mountain, 
  Trees, 
  Sun, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';

const OFFICE_ADDRESS_EN =
  'Door No. 10-1-2/1, Ground Floor, Om Shanthi Building Sataram, Bhadrachalam, Bhadradri Kothagudem, Telangana 507111';

const OFFICE_ADDRESS_TE =
  'డోర్ నెం. 10-1-2/1, గ్రౌండ్ ఫ్లోర్, ఓం శాంతి బిల్డింగ్ సతారం, భద్రాచలం, భద్రాద్రి కొత్తగూడెం జిల్లా, తెలంగాణ 507111';

const MAPS_LOCATION_URL = 'https://maps.app.goo.gl/ZZynQYDrgaDAipDz6?g_st=awb';

type HeritagePlace = {
  id: string;
  category: 'bhadrachalam' | 'papikondalu' | 'parnasala' | 'maredumilli';
  titleEn: string;
  titleTe: string;
  subtitleEn: string;
  subtitleTe: string;
  tagEn: string;
  tagTe: string;
  periodEn: string;
  periodTe: string;
  image: string;
  descriptionEn: string;
  descriptionTe: string;
  historyDetailsEn: string[];
  historyDetailsTe: string[];
  significanceEn: string;
  significanceTe: string;
};

const HERITAGE_PLACES: HeritagePlace[] = [
  {
    id: 'bhadrachalam-temple',
    category: 'bhadrachalam',
    titleEn: 'Bhadrachalam Sri Sita Ramachandra Swamy Temple',
    titleTe: 'భద్రాచలం శ్రీ సీతారామచంద్ర స్వామి దివ్యాలయం',
    subtitleEn: 'Vaikuntha Kshetram on the Sacred Banks of River Godavari',
    subtitleTe: 'గోదావరి తీరంలో వెలసిన దక్షిణ అయోధ్య శ్రీ వైకుంఠ క్షేత్రం',
    tagEn: 'Spiritual Heritage',
    tagTe: 'ఆధ్యాత్మిక వారసత్వం',
    periodEn: 'Ramayana Era & 17th Century AD',
    periodTe: 'రామాయణ త్రేతా యుగం & 17వ శతాబ్దం',
    image: 'https://res.cloudinary.com/r929tquv/image/upload/v1785916631/ts_boat_tourism/heritage/bdbrbzsh2gdxsxefhcvu.jpg',
    descriptionEn: 'Bhadrachalam is revered across the world as Dakshina Ayodhya. Situated gracefully along the Godavari river, it stands as the divine abode of Lord Sri Sita Ramachandra Swamy.',
    descriptionTe: 'భద్రాచలం ప్రపంచవ్యాప్తంగా "దక్షిణ అయోధ్య"గా పరమ పవిత్ర పుణ్యక్షేత్రంగా పూజలందుకుంటోంది. పుణ్య గోదావరి నదీ తీరాన వెలసిన శ్రీ సీతారామచంద్ర స్వామివారి దివ్య క్షేత్రం ఇది.',
    historyDetailsEn: [
      'Epic Ramayana Connection: During Treta Yuga, Lord Rama, Devi Sita, and Lakshmana spent years of their 14-year forest exile in Dandakaranya forest surrounding Bhadrachalam.',
      'The Legend of Bhadra: The place is named after Bhadra, a devout hillock mountain who performed intense penance to serve as the divine seat for Lord Rama.',
      'Bhakta Ramadasu & 17th Century Temple Construction: Kancharla Gopanna (popularly known as Bhakta Ramadasu), the Tahsildar of Palvancha in the 1600s, constructed the present temple complex using state revenues. When imprisoned by Golconda ruler Tani Shah, Lord Rama and Lakshmana themselves paid back 6 lakh gold coins (Ramadaasu Madaas) to free their devotee.',
      'Grand Celebrations: Famed for the annual Sri Rama Navami Kalyanam with royal Talambralu sent by the Government, and Mukkoti Vaikuntha Ekadasi Uttara Dwara Darshanam.'
    ],
    historyDetailsTe: [
      'రామాయణ త్రేతా యుగ సంబంధం: శ్రీరాముడు, సీతాదేవి మరియు లక్ష్మణులవారితో కలిసి తమ 14 ఏళ్ల అరణ్యవాసంలో భద్రాచలం పరిసరాల్లోని దండకారణ్యంలో నివసించారు.',
      'భద్రగిరి మహత్యం: రాముడి దివ్య స్పర్శ కోసం తపస్సు చేసిన భద్రుడనే ముని పేరు మీద ఈ కొండకు భద్రాచలం అనే పేరు వచ్చింది.',
      'భక్త రామదాసు వైభవం: 17వ శతాబ్దంలో పాల్వంచ తహసీల్దార్ కంచర్ల గోపన్న (భక్త రామదాసు) ప్రభుత్వ రాబడితో ఈ దివ్య ఆలయాన్ని నిర్మించారు. గోల్కొండ నవాబు తానీషా బంధించినప్పుడు శ్రీరామ లక్ష్మణులే స్వయంగా వచ్చి 6 లక్షల బంగారు నాణాలు (రామదాసు మాడలు) చెల్లించి రామదాసును విడిపించారు.',
      'వైభవంగా వేడుకలు: ప్రతి సంవత్సరం శ్రీరామ నవమికి ప్రభుత్వం తరఫున పట్టువస్త్రాలు, ముత్యాల తలంబ్రాల సమర్పణ మరియు ముక్కోటి వైకుంఠ ఏకాదశి ఉత్తర ద్వార దర్శనం అత్యంత వైభవంగా జరుగుతాయి.'
    ],
    significanceEn: 'One of the holiest Vaishnavite pilgrimage shrines in India where Lord Rama appears with Shankha and Chakra.',
    significanceTe: 'శ్రీరాముడు శంఖు చక్ర ధారియై చతుర్భుజ రూపంలో దర్శనమిచ్చే దేశంలోనే ఏకైక వైష్ణవ దివ్యక్షేత్రం.'
  },
  {
    id: 'papikondalu-gorge',
    category: 'papikondalu',
    titleEn: 'Papikondalu (Papi Hills) & Godavari River Passage',
    titleTe: 'పాపికొండలు (పాపి హిల్స్) & గోదావరి లోయ ప్రయాణం',
    subtitleEn: 'Mythical River Gorge Parting the Eastern Ghats Mountains',
    subtitleTe: 'తూర్పు కనుమల పర్వత శ్రేణులను చీల్చుకొని ప్రవహించే ప్రాకృతిక అద్భుతం',
    tagEn: 'Geological & Mythological Wonder',
    tagTe: 'ప్రకృతి రమణీయకత & పురాణ క్షేత్రం',
    periodEn: 'Ancient Vedic Times',
    periodTe: 'ప్రాచీన వేద కాలం',
    image: 'https://res.cloudinary.com/r929tquv/image/upload/v1785916634/ts_boat_tourism/heritage/bte1qkuvermlilay3ohs.jpg',
    descriptionEn: 'A breathtaking natural gorge where the mighty Godavari river narrows down and snakes between majestic, emerald-green peaks of the Eastern Ghats.',
    descriptionTe: 'గోదావరి నది తూర్పు కనుమల పచ్చని పర్వతాల మధ్య సన్నని లోయ గుండా ప్రవహించే కంటికి విందు చేసే ప్రకృతి రమణీయ దృశ్యం.',
    historyDetailsEn: [
      'Etymology of Papi Hills: The name original stems from "Papadia", the Telugu word for the parting of a woman’s hair (Pappidi), because from an aerial view, the river passage resembles a neat hair partition amidst dense mountain ranges.',
      'Sugriva’s Monkey Army Passage: Ancient folklore links Papikondalu to Kishkindha Kanda of Ramayana, where Sugriva sent search parties through these river valleys looking for Sita Devi.',
      'Perantapalli Ashram & Waterfalls: A serene tribal hamlet in the heart of Papikondalu hosting the Sri Ramakrishna Samsthan Ashram, established by Swami Balananda in 1927, surrounded by natural mountain rivulets.',
      'Kolluru Bamboo Island Huts: Traditional sandbank eco-camps where tourists stay under starlit nights surrounded by soaring cliff walls.'
    ],
    historyDetailsTe: [
      'పాపికొండల నామకరణం: స్త్రీల పాపిట (పాపిడి) ఆకారంలో పర్వత శ్రేణుల మధ్య గోదావరి ప్రవహించడం వల్ల వీటిని పాపికొండలు అని పిలుస్తారు.',
      'రామాయణ సుగ్రీవుడి సైన్యం: కిష్కింధ కాండ ప్రకారం సుగ్రీవుడి వానర సైన్యం సీతాదేవి అన్వేషణలో ఈ పర్వత లోయల గుండా పయనించినట్లు పురాణ కథనం.',
      'పేరంటపల్లి ఆశ్రమం & జలపాతం: 1927లో స్వామి బాలానందచే స్థాపించబడిన శ్రీ రామకృష్ణ సంస్థాన్ ఆశ్రమం, కొండకోనల మధ్య ప్రశాంతమైన ఆధ్యాత్మిక వాతావరణం.',
      'కొల్లూరు బ్యాంబూ హట్స్: గోదావరి ఇసుక తిన్నెలపై వెదురు గుడారాల మధ్య రాత్రి పూట నక్షత్రాల నీడలో విడిది చేసే మరపురాని అనుభూతి.'
    ],
    significanceEn: 'Widely celebrated as one of India’s most scenic river cruise passages, comparing to the Fjords of Norway.',
    significanceTe: 'నార్వే ఫియోర్డ్స్‌తో పోల్చదగిన భారతదేశంలోనే అత్యంత సుందరమైన నదీ జల ప్రయాణ లోయ.'
  },
  {
    id: 'parnasala-ashram',
    category: 'parnasala',
    titleEn: 'Parnasala Sacred Hermitage',
    titleTe: 'పర్ణశాల పవిత్ర కుటీరం',
    subtitleEn: 'The Hermitage of Lord Rama’s Exile in Dandakaranya',
    subtitleTe: 'దండకారణ్యంలో శ్రీరాముడి వనవాస దివ్య స్థలం',
    tagEn: 'Vedic Ramayana Site',
    tagTe: 'రామాయణ చారిత్రక క్షేత్రం',
    periodEn: 'Treta Yuga',
    periodTe: 'త్రేతా యుగం',
    image: '/ts-boat-tourism-banner.jpg',
    descriptionEn: 'Located 35 km from Bhadrachalam, Parnasala is the exact legendary location where Lord Rama constructed a simple leaf hut (Parna-Sala) during his forest exile.',
    descriptionTe: 'భద్రాచలం నుండి 35 కి.మీ దూరంలో ఉన్న పర్ణశాల, శ్రీరాముడు తన అరణ్యవాస సమయంలో ఆకులతో కుటీరాన్ని (పర్ణశాల) నిర్మించుకొని నివసించిన పవిత్ర స్థలం.',
    historyDetailsEn: [
      'Sita Vagu & Kuntellu Footprints: The serene stream where Sita Devi bathed, featuring natural rock formations shaped like traditional textile prints and divine footprints.',
      'Golden Deer (Maricha) Episode: The fateful site where Demon Maricha appeared in the guise of a dazzling golden deer (Golden Deer episode) to lure Lord Rama.',
      'Ravana’s Abduction: Parnasala marks the profound historical site from where Demon King Ravana abducted Sita Devi on his Pushpaka Vimana.'
    ],
    historyDetailsTe: [
      'సీతా వాగు & కుంటెల్లు: సీతాదేవి స్నానం చేసిన పవిత్ర వాగు, బట్టల గుర్తులు మరియు శ్రీరాముడి దివ్య పాదముద్రలు ఉన్న రాతి శిలలు.',
      'మారీచుడి మాయలేడి ఘట్టం: మారీచుడనే రాక్షసుడు బంగారు లేడిగా వచ్చి సీతాదేవిని ఆకర్షించిన చారిత్రక రామాయణ స్థలం.',
      'రావణాసురుడి అపహరణ: రావణాసురుడు పుష్పక విమానంపై సీతాదేవిని అపహరించిన పవిత్ర క్షేత్రం.'
    ],
    significanceEn: 'Essential pilgrimage site preserving ancient stone monuments and footprints commemorating Ramayana episodes.',
    significanceTe: 'రామాయణ ఘట్టాలకు సజీవ సాక్ష్యంగా నిలిచే పాదముద్రలు మరియు రాతి చిహ్నాలు ఉన్న పుణ్యక్షేత్రం.'
  },
  {
    id: 'maredumilli-rainforest',
    category: 'maredumilli',
    titleEn: 'Maredumilli & Rampachodavaram Eco-Rainforests',
    titleTe: 'మారేడుమిల్లి & రంపచోడవరం దట్టమైన అడవులు',
    subtitleEn: 'Pristine Jungle Waterfalls & Tribal Heritage of Eastern Ghats',
    subtitleTe: 'తూర్పు కనుమల జలపాతాలు & గిరిజన సాంప్రదాయ పర్యాటకం',
    tagEn: 'Eco-Tourism & Tribal Heritage',
    tagTe: 'ఇకో పర్యాటకం & గిరిజన సంస్కృతి',
    periodEn: 'Indigenous Tribal Traditions',
    periodTe: 'ప్రాచీన గిరిజన సాంప్రదాయాలు',
    image: 'https://res.cloudinary.com/r929tquv/image/upload/v1785916639/ts_boat_tourism/heritage/jehnpbngrz8tic8ybfqg.jpg',
    descriptionEn: 'A lush eco-tourism paradise nestled in the dense tropical forests of the Eastern Ghats, celebrated for cascading waterfalls, medicinal herbal reserves, and rich tribal culture.',
    descriptionTe: 'తూర్పు కనుమలలోని దట్టమైన అడవులు, ఎగిసిపడే జలపాతాలు, మూలికా వనాలు మరియు గిరిజన సంస్కృతికి నిలయమైన ప్రకృతి రమణీయ పర్యాటక కేంద్రం.',
    historyDetailsEn: [
      'Dense Canopy & Biodiversity: Home to ancient Valmiki and Konda Reddi tribal settlements who live in harmony with the medicinal flora and wildlife reserves.',
      'Jalatarangini & Amruthadhara Waterfalls: Natural cascading jungle streams flowing over multi-tiered granite rocks amidst wild bamboo thickets.',
      'Authentic Culinary Heritage: Pioneer of the world-famous "Bongu Kodi" (Bamboo Chicken), cooked inside fresh bamboo stalks without oil using traditional forest coals.'
    ],
    historyDetailsTe: [
      'దట్టమైన జీవ వైవిధ్యం: కొండరెడ్డి మరియు వాల్మీకి గిరిజన తెగలు ప్రకృతితో కలిసి జీవిస్తూ మూలికా అడవులను కాపాడుతున్న ప్రాంతం.',
      'జలతరంగిణి & అమృతధార జలపాతాలు: వెదురు పొదల మధ్య ఎత్తైన రాళ్లపై నుండి జాలువారే స్వచ్ఛమైన అటవీ సెలయేళ్లు.',
      'సాంప్రదాయ బొంగు చికెన్: పచ్చి వెదురు బొంగులలో నూనె లేకుండా బొగ్గులపై వండే ప్రపంచ ప్రసిద్ధి చెందిన గిరిజన వంటకం.'
    ],
    significanceEn: 'Telangana & Andhra Pradesh’s top eco-forest destination promoting sustainable tribal tourism and forest conservation.',
    significanceTe: 'గిరిజన సంస్కృతి మరియు అటవీ పరిరక్షణను చాటిచెప్పే అగ్రగామి ప్రకృతి పర్యాటక ప్రాంతం.'
  }
];

export default function AboutPage() {
  const language = useLanguageStore((s) => s.language);
  const isTe = language === 'te';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHeritage = HERITAGE_PLACES.filter(place => {
    const matchesCategory = activeCategory === 'all' || place.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      place.titleEn.toLowerCase().includes(searchLower) ||
      place.titleTe.toLowerCase().includes(searchLower) ||
      place.descriptionEn.toLowerCase().includes(searchLower) ||
      place.descriptionTe.toLowerCase().includes(searchLower) ||
      place.historyDetailsEn.some(d => d.toLowerCase().includes(searchLower)) ||
      place.historyDetailsTe.some(d => d.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. CLEAN LIGHT HERO BANNER */}
      <div className="bg-[#eaf7f6] border-b border-[#b9e4e5] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#1598a1]/30 text-[#1598a1] text-xs font-black uppercase tracking-widest shadow-xs mb-4">
            <ShieldCheck className="w-4 h-4 text-[#1598a1]" />
            <span>{isTe ? '2004 నుండి గోదావరి పర్యాటక సేవలు' : 'Pioneering Godavari Tourism Since 2004'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#0f3d56] tracking-tight leading-tight mb-4">
            {isTe ? 'టిఎస్ బోట్ టూరిజం & పుణ్యక్షేత్రాల చరిత్ర' : 'About TS Boat Tourism & Sacred Heritage'}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-medium">
            {isTe 
              ? 'భద్రాచలంలో అత్యంత విశ్వసనీయ ప్రభుత్వ గుర్తింపు పొందిన పర్యాటక సంస్థ. మా 20 సంవత్సరాల సుదీర్ఘ అనుభవం మరియు భద్రాచలం, పాపికొండలు, మారేడుమిల్లి పుణ్యక్షేత్రాల ఘన చరిత్రను దర్శించండి.'
              : 'Bhadrachalam’s most trusted government-registered tour agency. Explore our two-decade legacy and immerse yourself in the rich spiritual history of Bhadrachalam, Papikondalu, and Maredumilli.'
            }
          </p>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#1598a1]">20+</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">
                {isTe ? 'సంవత్సరాల అనుభవం' : 'Years Experience'}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#0f3d56]">100k+</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">
                {isTe ? 'సంతృప్తి చెందిన యాత్రికులు' : 'Happy Pilgrims'}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#1598a1]">3</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">
                {isTe ? 'లగ్జరీ ఏసీ బోట్లు' : 'Luxury Vessels'}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#0f3d56]">100%</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">
                {isTe ? 'ప్రభుత్వ MSME గుర్తింపు' : 'Govt. MSME Certified'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SECTION: ABOUT TS BOAT TOURISM COMPANY PROFILE */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-[#1598a1] text-xs font-black uppercase tracking-widest border border-teal-100">
                <History className="w-3.5 h-3.5" />
                <span>{isTe ? 'మా సంస్థ ప్రస్థానం' : 'Our Agency Legacy'}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#0f3d56] tracking-tight leading-tight">
                {isTe ? 'గోదావరి నదీ జలాలపై రెండు దశాబ్దాల విశ్వసనీయ సేవలు' : 'Two Decades of Excellence on River Godavari'}
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                {isTe ? (
                  <>2004 సంవత్సరంలో భద్రాచలంలో ప్రారంభమైన <strong className="text-[#1598a1] font-black">టిఎస్ బోట్ టూరిజం</strong> (హరిత బోట్ బుకింగ్ సమూహం), తెలంగాణ మరియు ఆంధ్రప్రదేశ్‌లలో అగ్రగామి నదీ పర్యాటక సంస్థగా ఎదిగింది.</>
                ) : (
                  <>Founded in <strong className="text-slate-900 font-extrabold">2004</strong> in Bhadrachalam, <strong className="text-[#1598a1] font-black">TS Boat Tourism</strong> (operating unit of HARITHA BOAT BOOKING) has grown into the premier travel and river cruise booking service in Telangana and Andhra Pradesh.</>
                )}
              </p>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                {isTe ? (
                  <>పాపికొండలకు ప్రత్యేక ఏసీ బోటు ప్రయాణాలు, కొల్లూరు వెదురు గుడారాల (బ్యాంబూ హట్స్) వసతి, భద్రాచలం-పర్ణశాల ఆధ్యాత్మిక యాత్రలు మరియు మారేడుమిల్లి అడవుల పర్యటనలను సురక్షితంగా నిర్వహిస్తున్నాము.</>
                ) : (
                  <>We specialize in curated A/C river cruises to <strong className="text-slate-900 font-extrabold">Papikondalu</strong>, stays at <strong className="text-slate-900 font-extrabold">Kolluru Bamboo Huts</strong>, temple pilgrimage packages to <strong className="text-slate-900 font-extrabold">Bhadrachalam & Parnasala</strong>, and eco-jungle tours to <strong className="text-slate-900 font-extrabold">Maredumilli</strong>.</>
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <ShieldCheck className="w-5 h-5 text-[#1598a1] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      {isTe ? '100% అధికారిక బుకింగ్ కేంద్రం' : '100% Authorized Office'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isTe ? 'భద్రాచలంలో ప్రభుత్వ MSME రిజిష్టర్డ్ పర్యాటక సంస్థ.' : 'Government MSME registered enterprise in Bhadrachalam.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Ship className="w-5 h-5 text-[#1598a1] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      {isTe ? 'అత్యాధునిక భద్రతా సౌకర్యాలు' : 'Modern Safety Fleet'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isTe ? 'పూర్తిగా తనిఖీ చేసిన లైఫ్ జాకెట్లు & నిపుణులైన డ్రైవర్లు.' : 'Fully certified life jackets, life rafts & licensed pilots.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Container */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md">
              <Image
                src="https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg"
                alt="Papikondalu Godavari River Cruise TS Boat Tourism"
                width={700}
                height={450}
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1598a1] uppercase tracking-widest">
                    {isTe ? 'పాపికొండలు నదీ ప్రయాణం' : 'Cruising Papikondalu Gorges'}
                  </div>
                  <div className="text-sm font-black text-[#0f3d56]">
                    {isTe ? 'టిఎస్ బోట్ టూరిజం లగ్జరీ బోట్లు' : 'TS Boat Tourism Luxury Vessels'}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-teal-50 text-[#1598a1] text-xs font-bold">
                  {isTe ? '2004 నుండి' : 'Since 2004'}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FLEET SHOWCASE */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[#1598a1] font-black tracking-[0.2em] uppercase text-xs mb-2 block">
              {isTe ? 'మా విలాసవంతమైన బోట్లు' : 'Our Cruise Fleet'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f3d56] tracking-tight">
              {isTe ? 'గోదావరి నదిపై సౌకర్యవంతమైన & సురక్షితమైన ప్రయాణం' : 'Luxury & Safety on River Godavari'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2 font-medium">
              {isTe
                ? 'మా అన్ని బోట్లలో అత్యాధునిక ఏసీ హాల్, విశాలమైన అప్పర్ వ్యూ డెక్ మరియు లైఫ్ జాకెట్లతో సహా పూర్తి మెరైన్ సేఫ్టీ సదుపాయాలు కలవు.'
                : 'Our vessels are custom-designed with climate-controlled A/C lower decks, wide upper viewing decks, and complete marine safety equipment.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                cap: isTe ? "50 సీట్లు" : "50 Seater", 
                title: isTe ? "ఇంటిమేట్ ఎక్స్‌ప్లోరర్" : "Intimate Explorer", 
                desc: isTe ? "చిన్న కుటుంబాలు, ప్రత్యేక భక్తుల బృందాలు మరియు ప్రైవేట్ ప్రయాణాలకు అత్యంత అనుకూలం." : "Designed for small family groups, VIP pilgrimage charters, and private events with personalized service." 
              },
              { 
                cap: isTe ? "100 సీట్లు" : "100 Seater", 
                title: isTe ? "ఎగ్జిక్యూటివ్ క్రూజర్" : "Executive Cruiser", 
                desc: isTe ? "రెండు డెక్కుల వ్యూ, ఏసీ లోయర్ డెక్ మరియు సాంప్రదాయ రుచికరమైన భోజన వసతి కలిగిన మా ప్రధాన బోటు." : "Our flagship boat featuring dual-deck viewing, climate-controlled A/C, and onboard traditional catering facilities." 
              },
              { 
                cap: isTe ? "150 సీట్లు" : "150 Seater", 
                title: isTe ? "గ్రాండ్ మెజెస్టిక్" : "Grand Majestic", 
                desc: isTe ? "పెద్ద యాత్రా బృందాలకు విశాలమైన సన్ డెక్, ఆడియో సిస్టమ్ మరియు విలాసవంతమైన ఆసీనుల సదుపాయం." : "High-capacity luxury vessel with expansive sun deck, sound system, and spacious seating for large tour groups." 
              }
            ].map((vessel, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#1598a1] flex items-center justify-center mb-4">
                    <Ship className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-[#1598a1] border border-teal-100 text-[10px] font-black uppercase tracking-wider mb-2">
                    {vessel.cap}
                  </span>
                  <h3 className="text-lg font-bold text-[#0f3d56] mb-2">{vessel.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">{vessel.desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                  <span className="px-2.5 py-1 rounded bg-slate-100">{isTe ? 'ఏసీ హాల్' : 'A/C Deck'}</span>
                  <span className="px-2.5 py-1 rounded bg-slate-100">{isTe ? 'లైఫ్ జాకెట్లు' : 'Life Jackets'}</span>
                  <span className="px-2.5 py-1 rounded bg-slate-100">{isTe ? 'రుచికరమైన భోజనం' : 'Onboard Meals'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HERITAGE & HISTORY SEARCH AND EXPLORER SECTION */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-widest mb-3">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>{isTe ? 'పవిత్ర చరిత్ర & సాంస్కృతిక వారసత్వం' : 'Sacred History & Cultural Legacy'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0f3d56] leading-tight">
              {isTe ? 'మా పుణ్యభూమి ఘనమైన చారిత్రక విశేషాలు' : 'Explore the Rich Heritage of Our Land'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2 font-medium">
              {isTe
                ? 'భద్రాచలం శ్రీ సీతారామచంద్ర స్వామి ఆలయ మహిమ, పాపికొండల ప్రకృతి రమణీయత మరియు మారేడుమిల్లి అటవీ సౌందర్యాన్ని తెలుసుకోండి.'
                : 'Discover the divine Ramayana history of Bhadrachalam, the mythological majesty of Papikondalu, and the ancient rainforests of Maredumilli.'
              }
            </p>

            {/* Search Input Bar */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={isTe 
                  ? 'చరిత్ర, ఆలయ విశేషాలు లేదా ప్రాంతాల పేరుతో శోధించండి (ఉదా: రామదాసు, పాపికొండలు)...'
                  : 'Search history, temple legends, or place names (e.g. Ramadasu, Papi Hills)...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 outline-none focus:border-[#1598a1] focus:ring-2 focus:ring-[#1598a1]/20 transition-all shadow-sm"
              />
            </div>

            {/* Filter Category Tabs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: 'all', label: isTe ? 'అన్ని పుణ్యక్షేత్రాలు' : 'All Heritage Sites', icon: Compass },
                { id: 'bhadrachalam', label: isTe ? 'భద్రాచలం రామాలయం' : 'Bhadrachalam Temple', icon: Sun },
                { id: 'papikondalu', label: isTe ? 'పాపికొండలు లోయ' : 'Papikondalu Gorge', icon: Mountain },
                { id: 'parnasala', label: isTe ? 'పర్ణశాల కుటీరం' : 'Parnasala Exile Site', icon: BookOpen },
                { id: 'maredumilli', label: isTe ? 'మారేడుమిల్లి అడవులు' : 'Maredumilli Eco Forests', icon: Trees },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1598a1] text-white shadow-sm scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* HERITAGE PLACES LIST */}
          <div className="space-y-8">
            {filteredHeritage.length === 0 ? (
              <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200">
                <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">
                  {isTe ? 'ఎటువంటి వివరాలు లభించలేదు' : 'No heritage results found'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  {isTe ? 'దయచేసి మీ శోధన పదాన్ని మార్చి ప్రయత్నించండి.' : 'Try resetting your search query or selecting another tab.'}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#1598a1] text-white font-bold text-xs shadow-sm hover:bg-[#0f7279]"
                >
                  {isTe ? 'శోధనను రీసెట్ చేయండి' : 'Reset Heritage Search'}
                </button>
              </div>
            ) : (
              filteredHeritage.map((place) => (
                <div
                  key={place.id}
                  id={place.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                    
                    {/* Image Column */}
                    <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden bg-slate-100">
                      <Image
                        src={place.image}
                        alt={isTe ? place.titleTe : place.titleEn}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                      
                      <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 text-xs font-bold shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isTe ? place.tagTe : place.tagEn}</span>
                      </div>

                      <div className="absolute bottom-4 left-4 text-xs font-bold text-slate-800 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 inline-block shadow-sm">
                        📅 {isTe ? 'కాలం:' : 'Period:'} {isTe ? place.periodTe : place.periodEn}
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                      <div>
                        <span className="text-[#1598a1] text-xs font-black uppercase tracking-widest block mb-1">
                          {isTe ? place.subtitleTe : place.subtitleEn}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-[#0f3d56] mb-3">
                          {isTe ? place.titleTe : place.titleEn}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                          {isTe ? place.descriptionTe : place.descriptionEn}
                        </p>

                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#0f3d56] flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-[#1598a1]" />
                            {isTe ? 'చారిత్రక విశేషాలు & ఆధ్యాత్మిక కథనం:' : 'Historical Highlights & Legends:'}
                          </h4>
                          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-normal">
                            {(isTe ? place.historyDetailsTe : place.historyDetailsEn).map((detail, dIdx) => (
                              <li key={dIdx} className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#1598a1] shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="text-xs text-[#0f6f78] font-bold bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl">
                          ✨ {isTe ? 'ప్రాముఖ్యత:' : 'Significance:'} {isTe ? place.significanceTe : place.significanceEn}
                        </div>

                        <Link
                          href={`/packages?q=${encodeURIComponent(place.titleEn.split(' ')[0])}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1598a1] text-white font-bold text-xs hover:bg-[#0f7279] transition-all shrink-0 shadow-sm"
                        >
                          <span>{isTe ? 'ప్యాకేజీలను చూడండి' : 'Explore Packages'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 5. GOVERNMENT MSME CERTIFICATION SECTION */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[#1598a1] font-black tracking-[0.2em] uppercase text-xs mb-2 block">
              {isTe ? 'ప్రభుత్వ గుర్తింపు పొందిన సంస్థ' : 'Official Enterprise Credentials'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f3d56] tracking-tight">
              {isTe ? 'భారత ప్రభుత్వ MSME నిబంధనల ప్రకారం రిజిష్టర్డ్ సంస్థ' : 'Government Registered MSME Enterprise'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2 font-medium">
              {isTe
                ? 'టిఎస్ బోట్ టూరిజం అనేది భారత ప్రభుత్వ సూక్ష్మ, చిన్న మరియు మధ్య తరహా పరిశ్రమల మంత్రిత్వ శాఖ (MSME) కింద నమోదైన హరిత బోట్ బుకింగ్ యొక్క అధికారిక నిర్వహణ విభాగం.'
                : 'TS Boat Tourism is an officially registered operating unit under HARITHA BOAT BOOKING registered with the Ministry of Micro, Small & Medium Enterprises (Govt. of India).'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Udyam Light Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5">
                <ShieldCheck className="w-8 h-8 text-[#1598a1]" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1598a1]">
                    {isTe ? 'భారత ప్రభుత్వం - MSME' : 'Govt. of India - MSME'}
                  </span>
                  <h3 className="text-lg font-black text-[#0f3d56]">
                    {isTe ? 'ఉద్యమ్ రిజిస్ట్రేషన్ సర్టిఫికేట్' : 'UDYAM REGISTRATION CERTIFICATE'}
                  </h3>
                </div>
              </div>

              <dl className="space-y-3 text-xs">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <dt className="text-[9px] uppercase font-bold text-slate-400">
                    {isTe ? 'సంస్థ పేరు' : 'Name of Enterprise'}
                  </dt>
                  <dd className="text-base font-black text-[#0f3d56] mt-0.5">HARITHA BOAT BOOKING</dd>
                  <dd className="text-[11px] text-[#1598a1] mt-0.5 font-bold">
                    {isTe ? 'నిర్వహణ విభాగం: టిఎస్ బోట్ టూరిజం' : 'Operating Unit: TS BOAT TOURISM'}
                  </dd>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <dt className="text-[9px] uppercase font-bold text-slate-400">
                      {isTe ? 'ఉద్యమ్ రిజిస్ట్రేషన్ నెం.' : 'Udyam Reg. No.'}
                    </dt>
                    <dd className="text-xs font-black text-[#1598a1] mt-0.5">UDYAM-TS-11-0024618</dd>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <dt className="text-[9px] uppercase font-bold text-slate-400">
                      {isTe ? 'సంస్థ రకం' : 'Enterprise Type'}
                    </dt>
                    <dd className="text-xs font-black text-slate-800 mt-0.5">Micro Enterprise</dd>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <dt className="text-[9px] uppercase font-bold text-slate-400">
                    {isTe ? 'యజమాని / ప్రొప్రైటర్' : 'Proprietor / Entrepreneur'}
                  </dt>
                  <dd className="text-xs font-black text-slate-800 mt-0.5">KANDHULA DURGA PRASAD</dd>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <dt className="text-[9px] uppercase font-bold text-slate-400">
                    {isTe ? 'ఎన్ఐసి కోడ్ (సేవలు)' : 'NIC Code (5-Digit)'}
                  </dt>
                  <dd className="text-xs font-semibold text-slate-700 mt-0.5">
                    {isTe ? '50212 — నదీ జల రవాణా & పర్యాటక బోటు సేవలు' : '50212 — Inland water passenger transport (River Cruises)'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Credential Specs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-[#0f3d56] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#1598a1]" />
                  <span>{isTe ? 'అధికారిక నిబంధనలు & భద్రతా ప్రమాణాలు' : 'Authorized Operation & Compliance'}</span>
                </h3>

                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  <p>
                    <strong className="text-slate-900 font-bold">{isTe ? 'అధికారిక అనుమతులు:' : 'Regulatory Approval:'}</strong>{' '}
                    {isTe 
                      ? 'మా నదీ పర్యాటక బోటు ప్రయాణాలు మరియు వసతి బుకింగ్లు తెలంగాణ పర్యాటక శాఖ మరియు ఇన్లాండ్ వాటర్ వేస్ భద్రతా నిబంధనల ప్రకారం నిర్వహించబడతాయి.'
                      : 'Our tourism operations, river boat charters, and accommodation bookings strictly follow safety guidelines framed by the Inland Waterways Authority and Telangana Tourism.'
                    }
                  </p>
                  <p>
                    <strong className="text-slate-900 font-bold">{isTe ? 'విశ్వసనీయ బుకింగ్ హామీ:' : 'Verified Booking Guarantee:'}</strong>{' '}
                    {isTe 
                      ? 'మా అధికారిక వెబ్‌సైట్ ద్వారా జరిగే ప్రతి బుకింగ్‌కు డిజిటల్ మరియు ప్రింటెడ్ అధికారిక రసీదు అందించబడుతుంది.'
                      : 'Every booking made through our official portal or central office receives an instant digital & physical voucher backed by our registered business entity.'
                    }
                  </p>
                  <p>
                    <strong className="text-slate-900 font-bold">{isTe ? 'తప్పనిసరి ధృవీకరణ:' : 'Mandatory Reporting:'}</strong>{' '}
                    {isTe 
                      ? 'ప్రయాణికులందరూ బోటు ప్రయాణానికి ముందు భద్రాచలంలోని మా ప్రధాన కార్యాలయంలో రిపోర్టింగ్ చేసి గుర్తింపు కార్డులు చూపించవలెను.'
                      : 'All passengers report to our Central Booking Office in Bhadrachalam prior to embarking on river cruises for safety briefing and document verification.'
                    }
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#eaf7f6] border border-[#b9e4e5] text-slate-800 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-[#1598a1] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="font-bold text-[#0f3d56] block mb-0.5">
                    {isTe ? 'బుకింగ్ సహాయం లేదా వివరాల కోసం సంప్రదించండి' : 'Need Booking Assistance or Office Directions?'}
                  </strong>
                  {isTe 
                    ? 'భద్రాచలంలోని మా ప్రధాన కార్యాలయాన్ని సందర్శించండి లేదా నేరుగా సంప్రదించండి: '
                    : 'Visit our Central Office in Bhadrachalam or call our dedicated lines at '
                  }
                  <a href="tel:+919951369573" className="font-black underline text-[#1598a1]">+91 99513 69573</a> / <a href="tel:+917780119268" className="font-black underline text-[#1598a1]">+91 77801 19268</a>.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CONTACT & LOCATION */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[#1598a1] text-xs font-black uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5" />
                <span>{isTe ? 'ప్రధాన బుకింగ్ కార్యాలయం' : 'Central Booking Office'}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#0f3d56] tracking-tight">
                {isTe ? 'భద్రాచలంలో మమ్మల్ని సంప్రదించండి' : 'Visit Us in Bhadrachalam'}
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                {isTe 
                  ? 'భద్రాచలం ప్రధాన బస్ స్టాండ్ మరియు ఆలయ రహదారికి సమీపంలో ఉన్న మా ప్రధాన కార్యాలయం ప్రతిరోజూ పర్యాటకులకు స్వాగతం పలుకుతుంది.'
                  : 'Located near the main bus stand and temple road, our central office is open every day to welcome tourists, issue physical travel vouchers, and coordinate boarding.'
                }
              </p>

              <dl className="space-y-4 pt-2 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#1598a1] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {isTe ? 'కార్యాలయ చిరునామా' : 'Office Address'}
                    </dt>
                    <dd className="font-bold text-slate-800 mt-0.5 leading-relaxed">
                      {isTe ? OFFICE_ADDRESS_TE : OFFICE_ADDRESS_EN}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#1598a1] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {isTe ? 'ఫోన్ నంబర్లు' : 'Contact Helplines'}
                    </dt>
                    <dd className="font-black text-[#1598a1] text-base mt-0.5">+91 99513 69573 &bull; +91 77801 19268</dd>
                  </div>
                </div>
              </dl>

              <div className="pt-3 flex flex-wrap gap-4">
                <a
                  href="tel:+919951369573"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1598a1] text-white font-bold text-sm shadow-md hover:bg-[#0f7279] transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isTe ? 'బుకింగ్ డెస్క్‌కి కాల్ చేయండి' : 'Call Booking Desk'}</span>
                </a>

                <a
                  href={MAPS_LOCATION_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  <Navigation className="w-4 h-4 text-[#1598a1]" />
                  <span>{isTe ? 'రూట్ మ్యాప్ చూడండి' : 'Get Directions'}</span>
                </a>
              </div>
            </div>

            {/* Map Embed Card */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 overflow-hidden shadow-sm h-[380px]">
              <iframe
                title="TS Boat Tourism Bhadrachalam Office Map"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7603.244137815757!2d80.884021!3d17.66805!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a36a9b83aea4343%3A0x7108b8976c666ac7!2sTS%20BOAT%20TOURISM!5e0!3m2!1sen!2sin!4v1784614051800!5m2!1sen!2sin"
                className="w-full h-full rounded-2xl"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
