import { getBanners } from "./actions";
import BannersClient from "./BannersClient";

export default async function BannersPage() {
  const banners = await getBanners();
  return <BannersClient banners={banners} />;
}
