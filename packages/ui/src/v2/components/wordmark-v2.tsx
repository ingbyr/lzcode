import { type ComponentProps, createUniqueId } from "solid-js"

export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  const filter = createUniqueId()
  const mask = createUniqueId()
  const maskGradient = createUniqueId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720.002 129.001"
      fill="none"
      preserveAspectRatio="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g opacity="0.16" filter={`url(#${filter})`} mask={`url(#${mask})`}>
        {/* L */}
        <path opacity="0.7" d="M0 0H18V90H0V0ZM0 72H55V90H0V72Z"
              transform="translate(125,30)" fill="currentColor"/>
        {/* Z */}
        <path opacity="0.7" d="M0 0H75V18H0V0ZM0 72H75V90H0V72ZM54 18H75V36H54V18ZM27 36H48V54H27V36ZM0 54H21V72H0V54Z"
              transform="translate(200,30)" fill="currentColor"/>
        {/* C */}
        <path opacity="0.7" d="M0 0H75V18H0V0ZM0 72H75V90H0V72ZM0 0H18V90H0V0ZM57 0H75V18H57V0ZM57 72H75V90H57V72Z"
              transform="translate(300,30)" fill="currentColor"/>
        {/* O */}
        <path opacity="0.7" d="M0 0H75V18H0V0ZM0 72H75V90H0V72ZM0 0H18V90H0V0ZM57 0H75V90H57V0Z"
              transform="translate(400,30)" fill="currentColor"/>
        {/* D */}
        <path opacity="0.7" d="M0 0H18V90H0V0ZM0 0H60V18H0V0ZM0 72H60V90H0V72ZM57 18H75V72H57V18Z"
              transform="translate(500,30)" fill="currentColor"/>
        {/* E */}
        <path opacity="0.7" d="M0 0H18V90H0V0ZM0 0H75V18H0V0ZM0 36H57V54H0V36ZM0 72H75V90H0V72Z"
              transform="translate(600,30)" fill="currentColor"/>
      </g>
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="129">
          <rect width="720" height="129" fill={`url(#${maskGradient})`} />
        </mask>
        <linearGradient id={maskGradient} x1="360" y1="0" x2="360" y2="112" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity="0.7" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <filter
          id={filter}
          x="0"
          y="0"
          width="720.002"
          height="130.001"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4938_16028" />
        </filter>
      </defs>
    </svg>
  )
}
