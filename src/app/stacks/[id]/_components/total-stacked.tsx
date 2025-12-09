import { Body, Heading3 } from "@breadcoop/ui";
import { CalendarDotsIcon } from "@phosphor-icons/react/ssr";
import TotalStackedButton from "./total-stacked-button";

const TotalStacked = () => {
	return (
		<section className="border border-[#CBE9E5] bg-paper-0 py-8 px-5 mb-[1.0625rem] md:mb-0 md:order-2 md:flex-1 md:max-w-[28.1875rem]">
			<Heading3 className="pb-3.5 border-b border-paper-2 text-center mb-[1.0625rem] text-2xl font-bold">
				Total stacked for you
			</Heading3>
			<div className="py-4 flex flex-col gap-4 items-center mb-[1.0625rem]">
				<p className="text-h2 text-surface-ink opacity-50">
					<span>$500</span>
					<span className="text-[2.21rem] text-surface-grey-2">
						.00
					</span>
				</p>
				<div className="flex flex-col gap-2 items-center">
					<Body className="text-surface-grey-2">500 $BREAD</Body>
					<Body className="text-xs">
						<span className="font-bold">
							You already claimed your sum.
						</span>{" "}
						Continue the depositing.
					</Body>
				</div>
			</div>
			<div className="flex items-center justify-between flex-wrap mb-[1.0625rem]">
				<Body>Last claim:</Body>
				<Body bold className="text-blue-2">
					0x67e567... (you)
				</Body>
				<div className="flex items-center justify-center gap-1">
					<CalendarDotsIcon
						size={16}
						className="fill-blue-2 shrink-0"
					/>
					<Body className="text-xs text-surface-ink">25/08/2025</Body>
				</div>
			</div>

			<TotalStackedButton />
		</section>
	);
};

export default TotalStacked;
