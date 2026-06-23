import { Body, Heading3 } from "@breadcoop/ui";
import { Icon } from "@phosphor-icons/react";

interface SectionHeaderProps {
  I: Icon;
  iconColor: string;
  title: string;
  subtitle: string;
}

const SectionHeader = ({
  I,
  iconColor,
  title,
  subtitle,
}: SectionHeaderProps) => (
  <div className="flex items-center gap-3 border-b border-paper-2 pb-4">
    <I size={28} className={iconColor} weight="fill" />
    <div>
      <Heading3 className="text-xl">{title}</Heading3>
      <Body className="text-surface-grey">{subtitle}</Body>
    </div>
  </div>
);

export default SectionHeader;
