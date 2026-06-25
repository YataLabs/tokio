const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const KEYWORDS = [
  ["buku tulis", "notebook"],
  ["buku", "book"],
  ["pensil", "pencil"],
  ["penghapus", "eraser"],
  ["pulpen", "pen"],
  ["penggaris", "ruler"],
  ["kertas", "paper"],
  ["kopi hitam", "black coffee"],
  ["kopi susu", "latte coffee"],
  ["kopi", "coffee"],
  ["roti bakar", "toast bread"],
  ["roti", "bread"],
  ["nasi", "rice food"],
  ["ayam", "chicken food"],
  ["mie", "noodle"],
  ["minuman", "drink beverage"],
  ["makanan", "food"],
  ["kaos", "tshirt clothing"],
  ["celana", "pants clothing"],
  ["sepatu", "shoes"],
  ["tas", "bag"],
  ["topi", "hat"],
  ["jam", "watch"],
  ["sabun", "soap"],
  ["sampo", "shampoo"],
  ["tissue", "tissue"],
  ["minyak", "oil"],
  ["susu", "milk"],
  ["teh", "tea"],
  ["juice", "juice"],
  ["snack", "snack"],
  ["coklat", "chocolate"],
  ["keripik", "chips snack"],
];

export function getItemImageUrl(item) {
  if (item.image_url) {
    // If it's already an absolute URL (e.g. Supabase storage), use it directly
    if (item.image_url.startsWith("http://") || item.image_url.startsWith("https://")) {
      return item.image_url;
    }
    return `${API_URL}${item.image_url}`;
  }
  const combined = `${item.name} ${item.category || ""}`.toLowerCase();
  let keyword = "product";
  for (const [id, kw] of KEYWORDS) {
    if (combined.includes(id)) {
      keyword = kw;
      break;
    }
  }
  return `https://loremflickr.com/400/200/${encodeURIComponent(keyword)}?lock=${item.id}`;
}
