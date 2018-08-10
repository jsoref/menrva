import React from "react";

const MarkDark = props => (
  <svg viewBox="0 0 27 28" {...props}>
    <title>mark dark</title>
    <defs>
      <linearGradient x1="100%" y1="0%" x2="0%" y2="100%" id="a">
        <stop stopColor="#27C0BB" offset="0%" />
        <stop stopColor="#118C86" offset="100%" />
      </linearGradient>
    </defs>
    <g fill="none">
      <path
        d="M.676 0h19.937l5.68 7.147v20.74H.028L0 .677A.676.676 0 0 1 .676 0z"
        fill="#252437"
      />
      <g transform="translate(3.04 2.873)">
        <path
          d="M12.31 15.312l-.982.002v1.55H8.714v1.366h-2.68v1.488H2.14V2.873c0-.435.353-.788.788-.788h12.897V6h2.08v5.628l-5.595 3.684z"
          fill="url(#a)"
        />
        <path
          d="M11.318 15.316v-6.14c0-.436.353-.789.789-.789h5.797v3.27l.018 1.193h-1.116v1.418H15.54v1.048h-4.22zm-7.825-5.06l6.587 6.583v.004H3.49v-6.587z"
          fill="#F53A33"
        />
        <path
          d="M20.155 13.887v7.036a.845.845 0 0 1-.845.845h-6.983"
          stroke="#F6DD55"
          strokeWidth={1.408}
        />
        <path stroke="#F53A33" strokeWidth={1.408} d="M15.814.043V5.82h4.506" />
        <path
          d="M2.038 21.78H.04V.79C.04.415.344.112.717.112h15.146l4.394 5.623v3.622"
          stroke="#F53A33"
          strokeWidth={1.408}
        />
        <path
          stroke="#E89832"
          strokeWidth={1.408}
          d="M17.298 15.326v3.538H13.81"
        />
        <ellipse fill="#F6DD55" cx={6.278} cy={6.225} rx={2.28} ry={2.282} />
      </g>
    </g>
  </svg>
);

export default MarkDark;
