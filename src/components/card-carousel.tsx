"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr";
import { useEffect, useState } from "react";
import Stack from "./stack";
import { ICircle } from "@/interfaces/circle";

interface CardCarouselProps {
	circles: ICircle[];
}

export default function CardCarousel({ circles }: CardCarouselProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [cardsPerPage, setCardsPerPage] = useState(1);
	const [isAnimating, setIsAnimating] = useState(false);
	const [direction, setDirection] = useState("next");

	const getCardsPerPage = () => {
		if (typeof window === "undefined") return 1;
		// if (window.innerWidth >= 1280) return 3; // xl
		if (window.innerWidth >= 1280) return circles.length; // xl
		if (window.innerWidth >= 1024) return 2; // lg
		return 1;
	};

	useEffect(() => {
		const handleResize = () => {
			const newCardsPerPage = getCardsPerPage();
			setCardsPerPage(newCardsPerPage);

			// Reset to page 1 if current page is out of bounds
			const newTotalPages = Math.ceil(circles.length / newCardsPerPage);
			if (currentPage > newTotalPages) {
				setCurrentPage(1);
			}
		};

		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [currentPage, circles.length]);

	const totalPages = Math.ceil(circles.length / cardsPerPage);
	const showNavigation = cardsPerPage < 3;

	const startIndex = (currentPage - 1) * cardsPerPage;
	const visibleCards = circles.slice(startIndex, startIndex + cardsPerPage);

	const goToNextPage = () => {
		if (currentPage < totalPages && !isAnimating) {
			setDirection("next");
			setIsAnimating(true);
			setTimeout(() => {
				setCurrentPage((prev) => prev + 1);
				setIsAnimating(false);
			}, 300);
		}
	};

	const goToPrevPage = () => {
		if (currentPage > 1 && !isAnimating) {
			setDirection("prev");
			setIsAnimating(true);
			setTimeout(() => {
				setCurrentPage((prev) => prev - 1);
				setIsAnimating(false);
			}, 300);
		}
	};

	return (
		<div className="">
			{/* Cards Container with overflow hidden */}
			<div className="overflow-hidden mb-8">
				<div
					className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-300 ease-in-out ${
						isAnimating
							? direction === "next"
								? "-translate-x-8 opacity-0"
								: "translate-x-8 opacity-0"
							: "translate-x-0 opacity-100"
					}`}
				>
					{visibleCards.map((card) => (
						<Stack stack={card} />
					))}
				</div>
			</div>

			{/* Navigation - only show on mobile and medium screens */}
			{showNavigation && totalPages > 1 && (
				<div className="flex items-center justify-center gap-4 py-2">
					<button
						onClick={goToPrevPage}
						disabled={currentPage === 1 || isAnimating}
						className="transition-colors text-primary-blue disabled:opacity-20"
						aria-label="Previous"
					>
						<CaretLeftIcon className="w-6 h-6" />
					</button>

					<span className="text-lg font-medium text-gray-700">
						{currentPage} / {totalPages}
					</span>

					<button
						onClick={goToNextPage}
						disabled={currentPage === totalPages || isAnimating}
						className="transition-colors text-primary-blue disabled:opacity-20"
						aria-label="Next"
					>
						<CaretRightIcon className="w-6 h-6" />
					</button>
				</div>
			)}
		</div>
	);
}
