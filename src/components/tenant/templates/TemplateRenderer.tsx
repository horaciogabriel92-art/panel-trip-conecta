import ClassicTemplate from "./ClassicTemplate";
import ListaTemplate from "./ListaTemplate";
import MagazineTemplate from "./MagazineTemplate";
import ShellTemplate from "./ShellTemplate";
import type { TemplateProps } from "./types";

export default function TemplateRenderer({ tenant, landing, paquetes, slug }: TemplateProps) {
  const template = landing?.template || "classic";

  switch (template) {
    case "lista":
      return <ListaTemplate tenant={tenant} landing={landing} paquetes={paquetes} slug={slug} />;
    case "magazine":
      return <MagazineTemplate tenant={tenant} landing={landing} paquetes={paquetes} slug={slug} />;
    case "shell":
      return <ShellTemplate tenant={tenant} landing={landing} paquetes={paquetes} slug={slug} />;
    case "classic":
    default:
      return <ClassicTemplate tenant={tenant} landing={landing} paquetes={paquetes} slug={slug} />;
  }
}
