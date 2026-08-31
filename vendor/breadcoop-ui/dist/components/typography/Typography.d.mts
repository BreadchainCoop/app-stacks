import React__default from 'react';

declare const fontVariables: {
    readonly breadDisplay: "--font-breadDisplay";
    readonly breadBody: "--font-breadBody";
};
declare const Typography: React__default.FC<{
    variant: "h1" | "h2" | "h3" | "h4" | "h5" | "body" | "caption";
    children: React__default.ReactNode;
    className?: string;
}>;
declare const Heading1: React__default.FC<{
    children: React__default.ReactNode;
    className?: string;
}>;
declare const Heading2: React__default.FC<{
    children: React__default.ReactNode;
    className?: string;
}>;
declare const Heading3: React__default.FC<{
    children: React__default.ReactNode;
    className?: string;
}>;
declare const Heading4: React__default.FC<{
    children: React__default.ReactNode;
    className?: string;
}>;
declare const Heading5: React__default.FC<{
    children: React__default.ReactNode;
    className?: string;
}>;
declare const Body: React__default.FC<{
    children: React__default.ReactNode;
    className?: string;
    bold?: boolean;
}>;
declare const Caption: React__default.FC<{
    children: React__default.ReactNode;
    className?: string;
}>;

export { Body, Caption, Heading1, Heading2, Heading3, Heading4, Heading5, Typography, fontVariables };
