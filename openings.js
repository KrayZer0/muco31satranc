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
      { san: 'e4', note: 'Merkezi ele geçirir; vezir ve fil için yol açar. Beyazın en popüler ilk hamlesi.' },
      { san: 'e5', note: 'Siyah merkezde eşit pay ister ve aynı şekilde karşılık verir.' },
      { san: 'Nf3', note: 'At geliştirilir ve aynı zamanda e5 piyonuna saldırılır.' },
      { san: 'Nc6', note: 'Siyah e5 piyonunu savunur, kendi atını da geliştirir.' },
      { san: 'Bc4', note: 'Fil, İtalyan Oyunu\'nun karakteristik hamlesiyle f7 karesini hedefler.' },
      { san: 'Bc5', note: 'Siyah da simetrik şekilde kendi filini aktif bir kareye çıkarır.' },
      { san: 'c3', note: 'Beyaz ileride d4 oynayarak merkezde güçlü bir piyon zinciri kurmaya hazırlanır.' },
      { san: 'Nf6', note: 'Siyah gelişimine devam eder ve e4 piyonuna baskı kurar.' },
      { san: 'd3', note: 'Sakin ve sağlam bir kuruluş (Giuoco Pianissimo); Beyaz merkezi koruyup rok yapmaya hazırlanır.' },
      { san: 'd6', note: 'Siyah da benzer şekilde merkezi destekler ve filinin çıkışını hazırlar.' },
      { san: 'O-O', note: 'Beyaz rok yaparak şahını güvene alır.' },
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
      { san: 'c5', note: 'Siyah simetrik oynamak yerine yandan karşılık verip dengesiz bir mücadele arar.' },
      { san: 'Nf3', note: 'Beyaz gelişimine devam eder, d4 hamlesine hazırlanır.' },
      { san: 'd6', note: 'Siyah gelecekteki e5 hamlesi için piyon yapısını hazırlar.' },
      { san: 'd4', note: 'Beyaz merkezde büyük bir piyon üstünlüğü kurmak ister.' },
      { san: 'cxd4', note: 'Siyah merkez piyonunu alarak Beyazın planını bozar.' },
      { san: 'Nxd4', note: 'Beyaz atıyla geri alır, merkezi güçlü bir at ile kontrol eder.' },
      { san: 'Nf6', note: 'Siyah e4 piyonuna baskı yaparak gelişimine devam eder.' },
      { san: 'Nc3', note: 'Beyaz e4 piyonunu korur ve gelişimini tamamlar.' },
      { san: 'a6', note: 'Najdorf\'un imza hamlesi: Siyah b5 ve Bb7 gibi planlara yer açar, Nb5 tehdidini engeller.' }
    ]
  },
  {
    id: 'french',
    name: 'Fransız Savunması',
    heroColor: 'b',
    summary: 'Siyah sağlam bir piyon yapısı kurar ama sıra gelen fili biraz sıkışık kalabilir. Stratejik bir açılış.',
    moves: [
      { san: 'e4', note: 'Beyaz merkezi ele geçirir.' },
      { san: 'e6', note: 'Siyah d5 hamlesini hazırlar; vezir filini bir tempo sonra dışarı çıkarmayı planlar.' },
      { san: 'd4', note: 'Beyaz merkezde iki piyonla güçlü bir yapı kurar.' },
      { san: 'd5', note: 'Siyah merkezde doğrudan karşılık verir; piyon zinciri gerilimi başlar.' },
      { san: 'Nc3', note: 'Beyaz e4 piyonunu korur ve gelişimine devam eder.' },
      { san: 'Nf6', note: 'Siyah da e4 piyonuna baskı yaparak gelişir.' },
      { san: 'Bg5', note: 'Beyaz fili aktif bir kareye çıkarır, Nf6 atını rahatsız eder.' },
      { san: 'Be7', note: 'Siyah filini geliştirip rok yapmaya hazırlanır.' }
    ]
  },
  {
    id: 'ruylopez',
    name: 'İspanyol Açılışı (Ruy Lopez)',
    heroColor: 'w',
    summary: 'Satranç tarihinin en eski ve en saygın açılışlarından biri; Beyaz uzun vadeli baskı kurar.',
    moves: [
      { san: 'e4', note: 'Merkezi ele geçirir.' },
      { san: 'e5', note: 'Siyah eşit karşılık verir.' },
      { san: 'Nf3', note: 'At gelişir, e5 piyonuna saldırır.' },
      { san: 'Nc6', note: 'Siyah e5 piyonunu savunur.' },
      { san: 'Bb5', note: 'İspanyol Açılışı\'nın karakteristik hamlesi: fil, e5 piyonunu dolaylı olarak savunan atı hedef alır.' },
      { san: 'a6', note: 'Siyah filin hemen kaçmasını ister ("Morphy Savunması").' },
      { san: 'Ba4', note: 'Beyaz fili geri çekmez, baskısını sürdürür.' },
      { san: 'Nf6', note: 'Siyah e4 piyonuna karşı baskı kurarak gelişimine devam eder.' },
      { san: 'O-O', note: 'Beyaz rok yaparak şahını güvene alır.' },
      { san: 'Be7', note: 'Siyah sağlam bir gelişim tercih ederek rok yapmaya hazırlanır.' }
    ]
  },
  {
    id: 'qgd',
    name: 'Vezir Gambiti (Kabul Edilmemiş)',
    heroColor: 'w',
    summary: 'Beyaz bir piyon feda eder gibi görünür ama asıl amaç merkezi güçlendirmektir. Klasik ve sağlam.',
    moves: [
      { san: 'd4', note: 'Beyaz merkezi vezir piyonuyla ele geçirir.' },
      { san: 'd5', note: 'Siyah aynı şekilde merkeze piyon sürer.' },
      { san: 'c4', note: 'Vezir Gambiti: Beyaz c4 piyonunu feda eder gibi görünse de asıl amaç d5 piyonunu zayıflatmaktır.' },
      { san: 'e6', note: 'Siyah gambiti kabul etmez, sağlam bir yapı kurmayı tercih eder.' },
      { san: 'Nc3', note: 'Beyaz gelişimine devam eder.' },
      { san: 'Nf6', note: 'Siyah da simetrik gelişir.' },
      { san: 'Bg5', note: 'Beyaz filini aktif bir kareye çıkarır ve Nf6 atına baskı yapar.' },
      { san: 'Be7', note: 'Siyah filini geliştirip rok yapmaya hazırlanır.' }
    ]
  },
  {
    id: 'london',
    name: 'Londra Sistemi',
    heroColor: 'w',
    summary: 'Ezberden çok fikre dayanan, hemen her savunmaya karşı kurulabilen pratik bir sistem.',
    moves: [
      { san: 'd4', note: 'Beyaz merkezi ele geçirir.' },
      { san: 'd5', note: 'Siyah simetrik karşılık verir.' },
      { san: 'Bf4', note: 'Londra Sistemi\'nin imzası: fil erkenden aktif bir kareye çıkar, sonradan piyon arkasında sıkışmaz.' },
      { san: 'Nf6', note: 'Siyah gelişimine devam eder.' },
      { san: 'e3', note: 'Beyaz filinin önünü kapatmadan merkezi destekler.' },
      { san: 'e6', note: 'Siyah da benzer bir yapı kurar.' },
      { san: 'Nf3', note: 'Beyaz atını geliştirip rok yapmaya hazırlanır.' },
      { san: 'Bd6', note: 'Siyah filini aktif bir kareye çıkarır.' },
      { san: 'Bg3', note: 'Beyaz fillerin değişimini önler, güçlü bir kare bulur.' }
    ]
  },
  {
    id: 'carokann',
    name: 'Caro-Kann Savunması',
    heroColor: 'b',
    summary: 'Sağlam ve az riskli bir savunma; Siyah vezir filini erken oyuna sokar.',
    moves: [
      { san: 'e4', note: 'Beyaz merkezi ele geçirir.' },
      { san: 'c6', note: 'Siyah d5 hamlesini hazırlar ve c8 filinin çıkışına yer açar.' },
      { san: 'd4', note: 'Beyaz merkezde iki piyonla üstünlük ister.' },
      { san: 'd5', note: 'Siyah merkeze doğrudan meydan okur.' },
      { san: 'Nc3', note: 'Beyaz e4 piyonunu korur.' },
      { san: 'dxe4', note: 'Siyah merkez piyonunu değişir.' },
      { san: 'Nxe4', note: 'Beyaz atıyla geri alır, merkezde aktif bir at bulundurur.' },
      { san: 'Bf5', note: 'Siyahın imza hamlesi: vezir filini piyon zincirinin dışına, erkenden aktif bir kareye çıkarır.' }
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
