import {
	forwardRef,
	InputHTMLAttributes,
	KeyboardEvent,
	ClipboardEvent,
	ChangeEvent,
} from "react";
import Input from "./input";

interface NumericInputProps extends Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"type" | "inputMode"
> {
	className?: string;
	placeholder?: string;
	value?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
	onPaste?: (e: ClipboardEvent<HTMLInputElement>) => void;
}

const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
	(
		{
			value,
			onChange,
			onKeyDown,
			onPaste,
			...props
		},
		ref,
	) => {
		const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
			// Allow: Ctrl/Cmd shortcuts for copy, paste, cut, select all
			if (e.ctrlKey || e.metaKey) {
				onKeyDown?.(e);
				return;
			}

			// Allow: navigation and editing keys
			const allowedKeys = [
				"Backspace",
				"Delete",
				"Tab",
				"Escape",
				"Enter",
				"ArrowLeft",
				"ArrowRight",
				"ArrowUp",
				"ArrowDown",
				"Home",
				"End",
			];

			if (allowedKeys.includes(e.key)) {
				onKeyDown?.(e);
				return;
			}

			// Allow decimal point if not already present
			if (e.key === "." || e.key === ",") {
				const target = e.target as HTMLInputElement;
				const currentValue = target.value || "";
				const selectionStart = target.selectionStart || 0;
				const selectionEnd = target.selectionEnd || 0;

				// Get the value that would result after this keypress
				const beforeSelection = currentValue.substring(
					0,
					selectionStart,
				);
				const afterSelection = currentValue.substring(selectionEnd);
				const newValue = beforeSelection + "." + afterSelection;

				// Check if this would create a second decimal point
				if (newValue.split(".").length > 2) {
					e.preventDefault();
					return;
				}

				onKeyDown?.(e);
				return;
			}

			// Allow only digits
			if (!/^\d$/.test(e.key)) {
				e.preventDefault();
				return;
			}
			onKeyDown?.(e);
		};

		const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
			const pastedText = e.clipboardData.getData("text");

			// Check if pasted text is valid (only digits and at most one decimal point)
			const isValid =
				/^[\d.]*$/.test(pastedText) &&
				pastedText.split(".").length <= 2;

			if (!isValid) {
				e.preventDefault();
				return;
			}

			// Check if pasting would create multiple decimal points
			const target = e.target as HTMLInputElement;
			const currentValue = target.value || "";
			const selectionStart = target.selectionStart || 0;
			const selectionEnd = target.selectionEnd || 0;

			const beforeSelection = currentValue.substring(0, selectionStart);
			const afterSelection = currentValue.substring(selectionEnd);
			const newValue = beforeSelection + pastedText + afterSelection;

			// Reject if result would have multiple decimal points
			if (newValue.split(".").length > 2) {
				e.preventDefault();
				return;
			}

			if (onPaste) onPaste(e);
		};

		return (
			<Input
				ref={ref}
				type="text"
				inputMode="decimal"
				value={value}
				onChange={onChange}
				onKeyDown={handleKeyDown}
				onPaste={handlePaste}
				{...props}
			/>
		);
	},
);

NumericInput.displayName = "NumericInput";

export default NumericInput;
