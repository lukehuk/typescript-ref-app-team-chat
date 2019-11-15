import React from "react";

const Add = (
  props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => (
  <svg width={20} height={20} {...props}>
    <title>{"Join conversation"}</title>
    <g transform="translate(1 1)" fill="none" fillRule="evenodd">
      <circle stroke="var(--accent-color-2)" cx={9} cy={9} r={9} />
      <path
        d="M5 9h8M9 5v8"
        stroke="var(--accent-color-2)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export { Add };
