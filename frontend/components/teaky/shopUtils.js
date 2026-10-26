export const CATEGORIES = ["Food", "Fashion", "Beauty", "Gadgets", "Books", "Services", "Other"];

export const formatPrice = (n) => String.fromCharCode(8358) + Number(n || 0).toLocaleString("en-NG");

export const shopUrl = (slug) => window.location.origin + "/shop/" + slug;

export const whatsappLink = (number, text) =>
  "https://wa.me/" + number + (text ? "?text=" + encodeURIComponent(text) : "");

export const shareShop = async (shop, toast) => {
  const url = shopUrl(shop.slug);
  try {
    if (navigator.share) {
      await navigator.share({ title: shop.name + " on Konnect", text: "Check out " + shop.name + " on Konnect", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast("Shop link copied", "success");
    }
  } catch (err) {
    if (err && err.name !== "AbortError") toast("Could not share the link", "error");
  }
};
