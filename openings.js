/* ============================================================
   openings.js — açılış kitabı ve ders içerikleri
   ============================================================ */

const OPENINGS = [
  {
    id: 'italian',
    name: 'İtalyan Oyunu',
    heroColor: 'w',
    summary: 'Beyaz hızlıca gelişir ve f7 karesini hedef alır. Başlangıç seviyesi için en doğal açılışlardan biri.',
    moves: [
      { san: 'e4', goal: 'Tahtanın ortasını hemen kontrol altına al; bu hem vezirine hem filine yol açar.', note: 'Merkezi ele geçirir; vezir ve fil için yol açar. Beyazın en popüler ilk hamlesi.' },
      { san: 'e5', note: 'Siyah merkezde eşit pay ister ve aynı şekilde karşılık verir.' },
      { san: 'Nf3', goal: 'Bir taşını oyuna sokarken aynı anda rakibin e5 piyonuna göz dağı ver.', note: 'At geliştirilir ve aynı zamanda e5 piyonuna saldırılır.' },
      { san: 'Nc6', note: 'Siyah e5 piyonunu savunur, kendi atını da geliştirir.' },
      { san: 'Bc4', goal: 'Filini, rakibin en kırılgan noktası olan f7\'ye bakacak şekilde konumlandır.', note: 'Fil, İtalyan Oyunu\'nun karakteristik hamlesiyle f7 karesini hedefler.' },
      { san: 'Bc5', note: 'Siyah da simetrik şekilde kendi filini aktif bir kareye çıkarır.' },
      { san: 'c3', goal: 'Şimdilik sakin dur ama d4\'ü oynayabilmek için zemin hazırla.', note: 'Beyaz ileride d4 oynayarak merkezde güçlü bir piyon zinciri kurmaya hazırlanır.' },
      { san: 'Nf6', note: 'Siyah gelişimine devam eder ve e4 piyonuna baskı kurar.' },
      { san: 'd3', goal: 'Merkezini pekiştirip rok için güvenli bir yapı kur.', note: 'Sakin ve sağlam bir kuruluş (Giuoco Pianissimo); Beyaz merkezi koruyup rok yapmaya hazırlanır.' },
      { san: 'd6', note: 'Siyah da benzer şekilde merkezi destekler ve filinin çıkışını hazırlar.' },
      { san: 'O-O', goal: 'Gelişimini tamamladın; artık şahını köşeye alma vakti.', note: 'Beyaz rok yaparak şahını güvene alır.' },
      { san: 'O-O', note: 'Siyah da rok yaparak dengeyi korur. Buradan itibaren orta oyun planları başlar.' }
    ]
  },
  {
    id: 'sicilian',
    name: 'Sicilya Savunması (Najdorf)',
    heroColor: 'b',
    summary: 'Siyahın 1.e4 karşısında en keskin ve en çok tercih edilen cevabı. Dengesiz ama zengin pozisyonlar üretir.',
    moves: [
      { san: 'e4', note: 'Beyaz merkezi ele geçirir.' },
      { san: 'c5', goal: 'e5 ile simetrik oynamak yerine, dengeyi bozacak bir kenar hamlesi ara.', note: 'Siyah simetrik oynamak yerine yandan karşılık verip dengesiz bir mücadele arar.' },
      { san: 'Nf3', note: 'Beyaz gelişimine devam eder, d4 hamlesine hazırlanır.' },
      { san: 'd6', goal: 'İleride e5\'i oynayabilmen için önce bir piyonla zemin hazırla.', note: 'Siyah gelecekteki e5 hamlesi için piyon yapısını hazırlar.' },
      { san: 'd4', note: 'Beyaz merkezde büyük bir piyon üstünlüğü kurmak ister.' },
      { san: 'cxd4', goal: 'Rakip merkezde güçlü bir piyon kurmadan önce değişime giderek planını boz.', note: 'Siyah merkez piyonunu alarak Beyazın planını bozar.' },
      { san: 'Nxd4', note: 'Beyaz atıyla geri alır, merkezi güçlü bir at ile kontrol eder.' },
      { san: 'Nf6', goal: 'Gelişirken aynı zamanda rakibin e4 piyonuna göz dağı ver.', note: 'Siyah e4 piyonuna baskı yaparak gelişimine devam eder.' },
      { san: 'Nc3', note: 'Beyaz e4 piyonunu korur ve gelişimini tamamlar.' },
      { san: 'a6', goal: 'Rakibin atının b5\'e sıçrayıp seni rahatsız etmesini önceden engelle.', note: 'Najdorf\'un imza hamlesi: Siyah b5 ve Bb7 gibi planlara yer açar, Nb5 tehdidini engeller.' }
    ]
  },
  {
    id: 'french',
    name: 'Fransız Savunması',
    heroColor: 'b',
    summary: 'Siyah sağlam bir piyon yapısı kurar ama sıra gelen fili biraz sıkışık kalabilir. Stratejik bir açılış.',
    moves: [
      { san: 'e4', note: 'Beyaz merkezi ele geçirir.' },
      { san: 'e6', goal: 'Hemen d5 oynayabilmek için bir hazırlık hamlesi yap.', note: 'Siyah d5 hamlesini hazırlar; vezir filini bir tempo sonra dışarı çıkarmayı planlar.' },
      { san: 'd4', note: 'Beyaz merkezde iki piyonla güçlü bir yapı kurar.' },
      { san: 'd5', goal: 'Merkezde piyonunla doğrudan gerilim yarat.', note: 'Siyah merkezde doğrudan karşılık verir; piyon zinciri gerilimi başlar.' },
      { san: 'Nc3', note: 'Beyaz e4 piyonunu korur ve gelişimine devam eder.' },
      { san: 'Nf6', goal: 'Gelişirken rakibin e4 piyonuna baskı uygulamayı unutma.', note: 'Siyah da e4 piyonuna baskı yaparak gelişir.' },
      { san: 'Bg5', note: 'Beyaz fili aktif bir kareye çıkarır, Nf6 atını rahatsız eder.' },
      { san: 'Be7', goal: 'Filini sakin bir kareye çıkarıp rok için hazırlan.', note: 'Siyah filini geliştirip rok yapmaya hazırlanır.' }
    ]
  },
  {
    id: 'ruylopez',
    name: 'İspanyol Açılışı (Ruy Lopez)',
    heroColor: 'w',
    summary: 'Satranç tarihinin en eski ve en saygın açılışlarından biri; Beyaz uzun vadeli baskı kurar.',
    moves: [
      { san: 'e4', goal: 'Merkezi ele geçirerek oyuna başla.', note: 'Merkezi ele geçirir.' },
      { san: 'e5', note: 'Siyah eşit karşılık verir.' },
      { san: 'Nf3', goal: 'Taş geliştirirken e5 piyonuna baskı kurmayı ihmal etme.', note: 'At gelişir, e5 piyonuna saldırır.' },
      { san: 'Nc6', note: 'Siyah e5 piyonunu savunur.' },
      { san: 'Bb5', goal: 'Doğrudan e5\'e değil, onu savunan atına dolaylı bir tehditle başla.', note: 'İspanyol Açılışı\'nın karakteristik hamlesi: fil, e5 piyonunu dolaylı olarak savunan atı hedef alır.' },
      { san: 'a6', note: 'Siyah filin hemen kaçmasını ister ("Morphy Savunması").' },
      { san: 'Ba4', goal: 'Rakip filini kaçırmaya çalışsa da baskını bırakıp hemen geri çekilme.', note: 'Beyaz fili geri çekmez, baskısını sürdürür.' },
      { san: 'Nf6', note: 'Siyah e4 piyonuna karşı baskı kurarak gelişimine devam eder.' },
      { san: 'O-O', goal: 'Gelişimin iyi durumda; şimdi şahını güvenli bir köşeye al.', note: 'Beyaz rok yaparak şahını güvene alır.' },
      { san: 'Be7', note: 'Siyah sağlam bir gelişim tercih ederek rok yapmaya hazırlanır.' }
    ]
  },
  {
    id: 'qgd',
    name: 'Vezir Gambiti (Kabul Edilmemiş)',
    heroColor: 'w',
    summary: 'Beyaz bir piyon feda eder gibi görünür ama asıl amaç merkezi güçlendirmektir. Klasik ve sağlam.',
    moves: [
      { san: 'd4', goal: 'Merkezi diğer merkez piyonunla ele geçir.', note: 'Beyaz merkezi vezir piyonuyla ele geçirir.' },
      { san: 'd5', note: 'Siyah aynı şekilde merkeze piyon sürer.' },
      { san: 'c4', goal: 'Rakibin d5 piyonuna yan taraftan baskı kurmayı dene; bir piyon feda ediyormuş gibi görünse de gerçek amaç farklı.', note: 'Vezir Gambiti: Beyaz c4 piyonunu feda eder gibi görünse de asıl amaç d5 piyonunu zayıflatmaktır.' },
      { san: 'e6', note: 'Siyah gambiti kabul etmez, sağlam bir yapı kurmayı tercih eder.' },
      { san: 'Nc3', goal: 'Merkez piyonunu koru ve gelişimine devam et.', note: 'Beyaz gelişimine devam eder.' },
      { san: 'Nf6', note: 'Siyah da simetrik gelişir.' },
      { san: 'Bg5', goal: 'Filini oyuna sokup rakibin f6 atını rahatsız et.', note: 'Beyaz filini aktif bir kareye çıkarır ve Nf6 atına baskı yapar.' },
      { san: 'Be7', note: 'Siyah filini geliştirip rok yapmaya hazırlanır.' }
    ]
  },
  {
    id: 'london',
    name: 'Londra Sistemi',
    heroColor: 'w',
    summary: 'Ezberden çok fikre dayanan, hemen her savunmaya karşı kurulabilen pratik bir sistem.',
    moves: [
      { san: 'd4', goal: 'Merkezi ele geçirerek başla.', note: 'Beyaz merkezi ele geçirir.' },
      { san: 'd5', note: 'Siyah simetrik karşılık verir.' },
      { san: 'Bf4', goal: 'Filini piyonların arkasında hapsolmadan hemen şimdi geliştir.', note: 'Londra Sistemi\'nin imzası: fil erkenden aktif bir kareye çıkar, sonradan piyon arkasında sıkışmaz.' },
      { san: 'Nf6', note: 'Siyah gelişimine devam eder.' },
      { san: 'e3', goal: 'Filinin çıkış yolunu kapatmadan merkezini destekle.', note: 'Beyaz filinin önünü kapatmadan merkezi destekler.' },
      { san: 'e6', note: 'Siyah da benzer bir yapı kurar.' },
      { san: 'Nf3', goal: 'Atını oyuna sokup rok için hazırlık yap.', note: 'Beyaz atını geliştirip rok yapmaya hazırlanır.' },
      { san: 'Bd6', note: 'Siyah filini aktif bir kareye çıkarır.' },
      { san: 'Bg3', goal: 'Filini rakibin değişim tehdidinden kaçıracak güvenli bir kareye çek.', note: 'Beyaz fillerin değişimini önler, güçlü bir kare bulur.' }
    ]
  },
  {
    id: 'carokann',
    name: 'Caro-Kann Savunması',
    heroColor: 'b',
    summary: 'Sağlam ve az riskli bir savunma; Siyah vezir filini erken oyuna sokar.',
    moves: [
      { san: 'e4', note: 'Beyaz merkezi ele geçirir.' },
      { san: 'c6', goal: 'd5\'i oynayabilmek için hazırlık yap, filinin çıkışını da unutma.', note: 'Siyah d5 hamlesini hazırlar ve c8 filinin çıkışına yer açar.' },
      { san: 'd4', note: 'Beyaz merkezde iki piyonla üstünlük ister.' },
      { san: 'd5', goal: 'Merkeze doğrudan meydan oku.', note: 'Siyah merkeze doğrudan meydan okur.' },
      { san: 'Nc3', note: 'Beyaz e4 piyonunu korur.' },
      { san: 'dxe4', goal: 'Gerilimi çözmek için merkez piyonunu değiş.', note: 'Siyah merkez piyonunu değişir.' },
      { san: 'Nxe4', note: 'Beyaz atıyla geri alır, merkezde aktif bir at bulundurur.' },
      { san: 'Bf5', goal: 'Vezir filini piyonların arkasında kalmadan, hemen şimdi aktif bir kareye çıkar.', note: 'Siyahın imza hamlesi: vezir filini piyon zincirinin dışına, erkenden aktif bir kareye çıkarır.' }
    ]
  },
  {
    id: 'scandinavian',
    name: 'İskandinav Savunması',
    heroColor: 'b',
    summary: 'Siyah hemen merkezde değişime gider ve vezirini erken oyuna sokar. Doğrudan ve öğrenmesi kolay bir savunma.',
    moves: [
      { san: 'e4', note: 'Beyaz merkezi ele geçirir.' },
      { san: 'd5', goal: 'Merkez piyonuna anında meydan oku.', note: 'Siyah hemen merkez piyonuna meydan okur.' },
      { san: 'exd5', note: 'Beyaz piyonu alır.' },
      { san: 'Qxd5', goal: 'Kaybettiğin piyonu hemen geri kazan; vezirin biraz erken sahneye çıkacak.', note: 'Siyah vezirle geri alır; erken vezir çıkışı riskli olsa da açık bir oyun sağlar.' },
      { san: 'Nc3', note: 'Beyaz gelişirken tempo kazanır, vezire saldırır.' },
      { san: 'Qa5', goal: 'Vezirini hem güvenli hem de rakibin atına baskı yapan bir kareye çek.', note: 'Vezir güvenli ve aktif bir kareye çekilir, c3 atına dolaylı baskı yapar.' },
      { san: 'd4', note: 'Beyaz merkezde büyük bir piyon üstünlüğü kurar.' },
      { san: 'Nf6', goal: 'Gelişimine devam et.', note: 'Siyah gelişimine devam eder.' },
      { san: 'Nf3', note: 'Beyaz da gelişimini tamamlar.' },
      { san: 'c6', goal: 'Vezirine kaçış karesi hazırla ve merkezini sağlamlaştır.', note: 'Siyah vezirine b5 karesi hazırlar ve merkezi destekler.' }
    ]
  },
  {
    id: 'english',
    name: 'İngiliz Açılışı',
    heroColor: 'w',
    summary: 'Beyaz merkezi kenar piyonuyla kontrol etmeyi tercih eder; esnek ve pozisyonel bir açılış.',
    moves: [
      { san: 'c4', goal: 'Merkezi doğrudan değil, kenardan bir piyonla kontrol etmeyi dene.', note: 'Beyaz merkezi yandan kontrol eder, d5 karesine göz diker.' },
      { san: 'e5', note: 'Siyah merkezi doğrudan ele geçirir (Ters Sicilya benzeri bir yapı).' },
      { san: 'Nc3', goal: 'Merkezdeki önemli kareleri kontrol eden bir taş geliştir.', note: 'Beyaz atını geliştirip e4 ve d5 karelerini kontrol eder.' },
      { san: 'Nf6', note: 'Siyah da simetrik gelişir.' },
      { san: 'Nf3', goal: 'Diğer atını da oyuna sok.', note: 'Beyaz gelişimine devam eder.' },
      { san: 'Nc6', note: 'Siyah merkezi desteklemeye devam eder.' },
      { san: 'g3', goal: 'Filini uzun çapraza yerleştirebilmen için önce yerini hazırla.', note: 'Beyaz filini fianketto ile g2 karesine hazırlar; uzun çapraz güçlü bir silah olur.' },
      { san: 'd5', note: 'Siyah merkezde girişim kurmak ister.' }
    ]
  },
  {
    id: 'scotch',
    name: 'Scotch Oyunu',
    heroColor: 'w',
    summary: 'Beyaz merkezde erken bir açılım yaparak taşlarına hareket alanı kazandırır; keskin ve doğrudan bir açılış.',
    moves: [
      { san: 'e4', goal: 'Merkezi ele geçir.', note: 'Merkezi ele geçirir.' },
      { san: 'e5', note: 'Siyah eşit karşılık verir.' },
      { san: 'Nf3', goal: 'Rakibin e5 piyonuna baskı kur.', note: 'At gelişir, e5 piyonuna saldırır.' },
      { san: 'Nc6', note: 'Siyah e5 piyonunu savunur.' },
      { san: 'd4', goal: 'Beklemeden merkezde hemen bir açılım yap.', note: 'Scotch\'un karakteristik hamlesi: Beyaz merkezde hemen açılım yapar.' },
      { san: 'exd4', note: 'Siyah merkez piyonunu alır.' },
      { san: 'Nxd4', goal: 'Merkezde güçlü ve etkili bir at bırak.', note: 'Beyaz atıyla geri alır, merkezde güçlü bir at bulundurur.' },
      { san: 'Bc5', note: 'Siyah filini aktif bir kareye çıkarır ve d4 atına baskı yapar.' }
    ]
  },
  {
    id: 'vienna',
    name: 'Viyana Oyunu',
    heroColor: 'w',
    summary: 'İtalyan ve Ruy Lopez\'e alternatif, atı erken c3 yerine c3 atına çıkaran esnek bir açılış.',
    moves: [
      { san: 'e4', goal: 'Merkezi ele geçir.', note: 'Merkezi ele geçirir.' },
      { san: 'e5', note: 'Siyah eşit karşılık verir.' },
      { san: 'Nc3', goal: 'Atını farklı bir kareye geliştirerek ileride f4 oynama seçeneğini sakla.', note: 'Beyaz atını Nf3 yerine önce c3\'e geliştirir; f4 hamlesine esneklik bırakır.' },
      { san: 'Nf6', note: 'Siyah e4 piyonuna baskı yaparak gelişimine devam eder.' },
      { san: 'g3', goal: 'Filini fianketto ile geliştirmeye zemin hazırla.', note: 'Beyaz filini fianketto ile geliştirmeye hazırlanır.' },
      { san: 'd5', note: 'Siyah merkezde girişim kurmak ister.' },
      { san: 'exd5', goal: 'Merkezde oluşan gerilimi piyon değişimiyle çöz.', note: 'Beyaz merkez piyonunu değişir.' },
      { san: 'Nxd5', note: 'Siyah atıyla geri alır, merkezde aktif bir at bulundurur.' }
    ]
  },
  {
    id: 'petrov',
    name: 'Petrov Savunması',
    heroColor: 'b',
    summary: 'Siyah simetrik oynayarak dengeyi korur; çok sağlam ama biraz pasif kabul edilen klasik bir savunma.',
    moves: [
      { san: 'e4', note: 'Beyaz merkezi ele geçirir.' },
      { san: 'e5', goal: 'Merkezde eşit karşılık ver.', note: 'Siyah eşit karşılık verir.' },
      { san: 'Nf3', note: 'Beyaz e5 piyonuna saldırır.' },
      { san: 'Nf6', goal: 'Piyonunu savunmak yerine aynı fikirle karşı saldırıya geç.', note: 'Siyah, piyonu savunmak yerine aynı şekilde karşı saldırıya geçer.' },
      { san: 'Nxe5', note: 'Beyaz piyonu alır.' },
      { san: 'd6', goal: 'Rakibin merkezdeki atını geri çekilmeye zorla.', note: 'Siyah atı geri çekilmeye zorlar.' },
      { san: 'Nf3', note: 'Beyaz at güvenli bir kareye döner.' },
      { san: 'Nxe4', goal: 'Sen de simetrik şekilde merkez piyonunu al.', note: 'Siyah da simetrik olarak merkez piyonunu alır; pozisyon dengelenir.' },
      { san: 'd4', note: 'Beyaz merkezde büyük bir piyon üstünlüğü kurar.' },
      { san: 'd5', goal: 'Merkezini sağlam bir piyonla destekle.', note: 'Siyah merkezi sağlam şekilde destekler.' },
      { san: 'Bd3', note: 'Beyaz filini aktif bir kareye çıkarır.' },
      { san: 'Nc6', goal: 'Gelişimine devam et.', note: 'Siyah gelişimine devam eder.' }
    ]
  }
];

/**
 * Verilen SAN hamle dizisine (oynanan oyun) bakarak hangi açılış(lar)a
 * uyduğunu bulur. Tam eşleşen en uzun hattı döndürür.
 */
function recognizeOpening(sanHistory) {
  let best = null;
  let bestLen = 0;
  for (const opening of OPENINGS) {
    let matched = 0;
    for (let i = 0; i < sanHistory.length && i < opening.moves.length; i++) {
      if (opening.moves[i].san === sanHistory[i]) {
        matched++;
      } else {
        break;
      }
    }
    if (matched > bestLen && matched >= 2) {
      bestLen = matched;
      best = opening;
    }
  }
  if (!best) return null;
  return { opening: best, matchedPlies: bestLen, isComplete: bestLen === best.moves.length };
}
