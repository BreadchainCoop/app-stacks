import * as react_jsx_runtime from 'react/jsx-runtime';
import { ButtonHTMLAttributes } from 'react';
import { UseCopyToClipboardPayload } from '../../hooks/use-copy-to-clipboard.mjs';

interface CopyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, UseCopyToClipboardPayload {
    checkedIconSize?: number;
}
declare const CopyButtonIcon: ({ children, textToCopy, checkedIconSize, ...buttonProps }: CopyButtonProps) => react_jsx_runtime.JSX.Element;

export { CopyButtonIcon as default };
