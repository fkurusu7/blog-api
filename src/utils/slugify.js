export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]g/, "") // Remove non-word chars (except spaces and dashes)
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-") // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
};
