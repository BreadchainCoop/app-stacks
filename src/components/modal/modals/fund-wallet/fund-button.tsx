import { Body } from "@breadcoop/ui";
import { ReactNode } from "react";

export interface FundButtonProps {
  imgSrc: string;
  title: string;
  infos: Array<{ label: string; bold?: boolean; className?: string }>;
  onClick: () => void;
  leftItem?: ReactNode;
}

const FundButton = ({
  title,
  infos,
  imgSrc,
  onClick,
  leftItem,
}: FundButtonProps) => {
  const totalInfos = infos.length;
  return (
    <button
      type="button"
      className="border border-paper-2 bg-paper-0 flex items-center justify-start gap-4 py-2.5 px-5 cursor-pointer w-full transition-colors hover:border-primary-blue hover:bg-blue-0"
      onClick={onClick}
    >
      <figure className="w-8 h-8 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt="" />
      </figure>
      <div className="text-left mr-auto">
        <Body className="text-surface-ink" bold>
          {title}
        </Body>
        <div className="text-surface-grey flex items-center justify-start gap-1.5 mt-1">
          {infos.map((info, index) => {
            return (
              <>
                <Body bold={info.bold} className={info.className}>
                  {info.label}
                </Body>
                {index < totalInfos - 1 && (
                  <span className="inline-block h-1 w-1 bg-surface-grey" />
                )}
              </>
            );
          })}
        </div>
      </div>
      {leftItem}
    </button>
  );
};

export default FundButton;
