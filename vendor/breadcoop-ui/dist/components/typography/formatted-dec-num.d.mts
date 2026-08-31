import * as react_jsx_runtime from 'react/jsx-runtime';

interface FormattedDecimalNumberProps {
    value: number | string;
    className?: string;
    integralPartClassName?: string;
    decimalPartClassName?: string;
    withBreadIcon?: boolean;
    breadIconClassName?: string;
    breadSize?: number;
    unit?: string;
}
declare function FormattedDecimalNumber({ value, className, integralPartClassName, decimalPartClassName, withBreadIcon, breadIconClassName, breadSize, unit, }: FormattedDecimalNumberProps): react_jsx_runtime.JSX.Element;

export { FormattedDecimalNumber };
