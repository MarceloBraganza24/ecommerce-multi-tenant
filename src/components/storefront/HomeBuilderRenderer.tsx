import { HomeSection } from "@/types/builder";
import { sectionRegistry } from "@/lib/builder/sectionRegistry";

type Props = {
  sections: HomeSection[];
};

export function HomeBuilderRenderer({ sections }: Props) {
  const orderedSections = [...sections]
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <main>
      {orderedSections.map((section) => {
        const Component = sectionRegistry[section.type];

        if (!Component) return null;

        return <Component key={section.id} {...section.props} />;
      })}
    </main>
  );
}