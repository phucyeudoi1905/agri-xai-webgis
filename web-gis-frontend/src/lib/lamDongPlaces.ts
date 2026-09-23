/** Điểm địa danh trọng điểm trong tỉnh Lâm Đồng (WGS84). */
export interface LamDongPlace {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  zoom: number;
  /** Từ khóa phụ để tìm (không dấu / tên khác) */
  aliases: string[];
}

export const LAM_DONG_PLACES: LamDongPlace[] = [
  {
    id: 'da-lat',
    name: 'Đà Lạt',
    district: 'TP Đà Lạt',
    lat: 11.9404,
    lng: 108.4583,
    zoom: 13,
    aliases: ['dalat', 'thanh pho da lat', 'da lat'],
  },
  {
    id: 'cau-dat',
    name: 'Cầu Đất',
    district: 'TP Đà Lạt · Vùng cà phê',
    lat: 11.883,
    lng: 108.472,
    zoom: 14,
    aliases: ['caudat', 'cau dat farm', 'htx cau dat'],
  },
  {
    id: 'lac-duong',
    name: 'Lạc Dương',
    district: 'Huyện Lạc Dương',
    lat: 12.075,
    lng: 108.438,
    zoom: 12,
    aliases: ['lacduong', 'lac duong', 'langbiang'],
  },
  {
    id: 'lang-biang',
    name: 'Núi Langbiang',
    district: 'Lạc Dương',
    lat: 12.047,
    lng: 108.44,
    zoom: 14,
    aliases: ['langbiang', 'lang biang', 'doi che'],
  },
  {
    id: 'duc-trong',
    name: 'Đức Trọng',
    district: 'Huyện Đức Trọng',
    lat: 11.687,
    lng: 108.373,
    zoom: 12,
    aliases: ['ductrong', 'duc trong', 'lien khuong'],
  },
  {
    id: 'don-duong',
    name: 'Đơn Dương',
    district: 'Huyện Đơn Dương',
    lat: 11.807,
    lng: 108.553,
    zoom: 12,
    aliases: ['donduong', 'don duong', 'dran'],
  },
  {
    id: 'bao-loc',
    name: 'Bảo Lộc',
    district: 'TP Bảo Lộc',
    lat: 11.548,
    lng: 107.807,
    zoom: 12,
    aliases: ['baoloc', 'bao loc'],
  },
  {
    id: 'di-linh',
    name: 'Di Linh',
    district: 'Huyện Di Linh',
    lat: 11.58,
    lng: 108.075,
    zoom: 12,
    aliases: ['dilinh', 'di linh'],
  },
  {
    id: 'lam-ha',
    name: 'Lâm Hà',
    district: 'Huyện Lâm Hà',
    lat: 11.8,
    lng: 108.2,
    zoom: 11,
    aliases: ['lamha', 'lam ha'],
  },
  {
    id: 'trai-mat',
    name: 'Trại Mát',
    district: 'TP Đà Lạt',
    lat: 11.905,
    lng: 108.515,
    zoom: 14,
    aliases: ['traimat', 'trai mat', 'atiso'],
  },
  {
    id: 'thai-phien',
    name: 'Thái Phiên',
    district: 'TP Đà Lạt · Hoa',
    lat: 11.952,
    lng: 108.522,
    zoom: 14,
    aliases: ['thaiphien', 'thai phien'],
  },
  {
    id: 'van-thanh',
    name: 'Vạn Thành',
    district: 'TP Đà Lạt · Rau thủy canh',
    lat: 11.93,
    lng: 108.44,
    zoom: 14,
    aliases: ['vanthanh', 'van thanh'],
  },
  {
    id: 'xuan-truong',
    name: 'Xuân Trường',
    district: 'TP Đà Lạt',
    lat: 11.91,
    lng: 108.48,
    zoom: 14,
    aliases: ['xuantruong', 'xuan truong'],
  },
  {
    id: 'ho-tuyen-lam',
    name: 'Hồ Tuyền Lâm',
    district: 'TP Đà Lạt',
    lat: 11.88,
    lng: 108.43,
    zoom: 14,
    aliases: ['tuyenlam', 'ho tuyen lam', 'tuyen lam'],
  },
  {
    id: 'bao-lam',
    name: 'Bảo Lâm',
    district: 'Huyện Bảo Lâm',
    lat: 11.65,
    lng: 107.72,
    zoom: 11,
    aliases: ['baolam', 'bao lam'],
  },
  {
    id: 'da-huoai',
    name: 'Đạ Huoai',
    district: 'Huyện Đạ Huoai',
    lat: 11.42,
    lng: 107.62,
    zoom: 11,
    aliases: ['dahuoai', 'da huoai'],
  },
  {
    id: 'cat-tien',
    name: 'Cát Tiên',
    district: 'Huyện Cát Tiên',
    lat: 11.42,
    lng: 107.43,
    zoom: 11,
    aliases: ['cattien', 'cat tien', 'vuon quoc gia'],
  },
];

function normalizeVi(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

/** Gợi ý địa danh theo chuỗi tìm (không dấu). Rỗng → trả về danh sách nổi bật. */
export function filterLamDongPlaces(query: string, limit = 8): LamDongPlace[] {
  const q = normalizeVi(query);
  if (!q) {
    return LAM_DONG_PLACES.slice(0, limit);
  }

  return LAM_DONG_PLACES.filter((place) => {
    const haystack = normalizeVi(
      [place.name, place.district, ...place.aliases].join(' '),
    );
    return haystack.includes(q);
  }).slice(0, limit);
}
