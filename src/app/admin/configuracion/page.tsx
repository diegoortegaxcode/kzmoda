import { fetchSettings } from "./actions";
import ConfiguracionClient from "./ConfiguracionClient";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const settings = await fetchSettings();
  return (
    <ConfiguracionClient
      settings={{
        name:           settings.name,
        whatsapp:       settings.whatsapp,
        address:        settings.address,
        instagram:      settings.instagram,
        catalogTagline: settings.catalogTagline,
        skuPrefixes:    settings.skuPrefixes,
      }}
    />
  );
}
