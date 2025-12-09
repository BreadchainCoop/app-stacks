// export const CircularProgressIcon = () => (
// 	<div>
// 		<svg
// 			width="56"
// 			height="56"
// 			viewBox="0 0 56 56"
// 			fill="none"
// 			xmlns="http://www.w3.org/2000/svg"
// 		>
// 			<path
// 				d="M52 28C52 31.1517 51.3792 34.2726 50.1731 37.1844C48.967 40.0962 47.1992 42.742 44.9706 44.9706C42.742 47.1992 40.0962 48.967 37.1844 50.1731C34.2726 51.3792 31.1517 52 28 52C24.8483 52 21.7274 51.3792 18.8156 50.1731C15.9038 48.967 13.258 47.1992 11.0294 44.9706C8.80083 42.742 7.033 40.0962 5.82689 37.1844C4.62078 34.2726 4 31.1517 4 28C4 24.8483 4.62078 21.7274 5.82689 18.8156C7.03301 15.9038 8.80083 13.258 11.0294 11.0294C13.258 8.80083 15.9038 7.033 18.8156 5.82689C21.7274 4.62078 24.8483 4 28 4C31.1517 4 34.2726 4.62078 37.1844 5.82689C40.0962 7.03301 42.742 8.80083 44.9706 11.0294C47.1992 13.258 48.967 15.9038 50.1731 18.8156C51.3792 21.7274 52 24.8483 52 28L52 28Z"
// 				stroke="#808080"
// 				strokeWidth="8"
// 			/>
// 			<path
// 				d="M52 28C52 31.7874 51.1036 35.5211 49.3842 38.8958C47.6647 42.2704 45.171 45.1902 42.1068 47.4164C39.0427 49.6426 35.4952 51.112 31.7544 51.7045C28.0136 52.297 24.1857 51.9957 20.5836 50.8254"
// 				stroke="#A8C3EA"
// 				strokeWidth="8"
// 				strokeLinecap="round"
// 			/>
// 		</svg>
// 	</div>
// );

import clsx from "clsx";

export const CircularProgressIcon = ({ className }: { className?: string }) => {
	return (
		<div className={clsx("relative w-8 h-8", className)}>
			<svg
				className="w-full h-full transform -rotate-90"
				viewBox="0 0 120 120"
			>
				<circle
					cx="60"
					cy="60"
					r="50"
					fill="none"
					strokeWidth="20"
					className="stroke-surface-grey"
				/>
				<circle
					cx="60"
					cy="60"
					r="50"
					fill="none"
					stroke="#A8C3EA"
					strokeWidth="20"
					strokeDasharray="314"
					strokeDashoffset="235"
					strokeLinecap="round"
					className="origin-center animate-spin"
					style={{ animationDuration: "2s" }}
				/>
			</svg>
		</div>
	);
};
