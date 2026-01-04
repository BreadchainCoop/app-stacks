import { useReadContract, useReadContracts } from "wagmi";
import { useState, useMemo, useEffect } from "react";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "../lib/constants";
import { savingCirclesAbi } from "../lib/abis/saving-circles";
import { useTotalCircles } from "./use-total-circles";

const CONTRACT_ADDRESS = SAVING_CIRCLES_CONTRACT_ADDRESS; // Your contract address

// Hook to get paginated circles
export function useCirclesPaginated(page: number, pageSize: number = 10) {
	const { total, isLoading: loadingTotal } = useTotalCircles();

	const startId = page * pageSize;
	const endId = Math.min(startId + pageSize, total);
	const hasMore = endId < total;

	// Create array of contract calls for getCircle
	const circleContracts = useMemo(() => {
		if (startId >= total) return [];

		return Array.from({ length: endId - startId }, (_, i) => ({
			address: CONTRACT_ADDRESS,
			abi: savingCirclesAbi,
			functionName: "getCircle",
			args: [BigInt(startId + i)],
		}));
	}, [startId, endId, total]);

	const { data: circlesData, isLoading: loadingCircles } = useReadContracts({
		contracts: circleContracts,
	});

	// Transform the data
	const circles = useMemo(() => {
		if (!circlesData) return [];

		return circlesData
			.map((result, index) => {
				if (result.status !== "success" || !result.result) return null;

				const circle = result.result as any;
				return {
					id: startId + index,
					owner: circle.owner,
					currentIndex: circle.currentIndex,
					depositAmount: circle.depositAmount,
					token: circle.token,
					depositInterval: circle.depositInterval,
					effectiveCircleStartTime: circle.effectiveCircleStartTime,
					circleEnd: circle.circleEnd,
				};
			})
			.filter(Boolean);
	}, [circlesData, startId]);

	return {
		circles,
		isLoading: loadingTotal || loadingCircles,
		hasMore,
		totalPages: Math.ceil(total / pageSize),
		currentPage: page,
	};
}

// Hook to get paginated circles with member counts

// Hook to get user's circles
