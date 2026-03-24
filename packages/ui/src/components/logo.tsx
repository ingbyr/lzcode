import { ComponentProps } from "solid-js"

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path data-slot="logo-logo-mark-shadow" d="M12 16H4V8H12V16Z" fill="var(--icon-weak-base)" />
      <path data-slot="logo-logo-mark-o" d="M12 4H4V16H12V4ZM16 20H0V0H16V20Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <g data-cell-id="0">
          <g data-cell-id="1">
            <g data-cell-id="SLQSbJwD_n-blhHmYasz-1">
              <g transform="translate(0.5,0.5)">
                <path
                  d="M 30.81 0.11 C 25.79 0 20.89 1.16 16.54 3.44 C 15.66 3.71 14.97 4.56 14.97 5.48 C 14.97 6.74 15.96 7.61 17.1 7.61 C 17.43 7.61 17.74 7.52 19.84 6.43 C 21.95 5.33 26.32 4.34 30.69 4.46 C 37.54 4.58 43.92 7.46 48.65 12.32 C 53.38 17.18 55.87 23.69 55.75 30.43 C 55.75 33.68 55.1 36.77 53.9 39.61 C 53.86 39.61 53.82 39.61 53.77 39.61 C 51.71 39.61 50.03 41.35 50.03 43.48 C 50.03 45.61 51.71 47.34 53.77 47.34 C 55.84 47.34 57.51 45.61 57.51 43.48 C 57.51 42.89 57.38 42.33 57.15 41.83 C 58.83 38.05 59.78 34.18 59.88 30.22 C 60 22.34 57.16 14.99 51.65 9.23 C 46.14 3.47 38.8 0.35 30.81 0.11 Z M 7.72 9.11 C 5.66 9.11 3.98 10.85 3.98 12.98 C 3.98 13.65 4.15 14.29 4.44 14.84 C 1.98 18.98 0.5 23.81 0.36 28.84 C 0 45.1 13.08 58.59 29.55 59.1 L 30.3 59.1 C 36.53 59.1 42.51 57.09 47.75 53.34 C 48.02 53.07 48.26 52.59 48.26 52.08 C 48.26 50.94 47.37 50.07 46.26 50.07 C 45.63 50.07 45.24 50.22 44.88 50.58 C 40.27 53.7 35.03 55.32 29.55 55.2 C 22.69 55.08 16.32 52.2 11.59 47.34 C 6.86 42.49 4.37 35.98 4.49 29.23 C 4.6 24.93 5.93 20.63 8.24 16.81 C 10.06 16.55 11.47 14.93 11.47 12.98 C 11.47 10.85 9.79 9.11 7.72 9.11 Z M 21.32 12.62 C 18.83 12.62 16.2 14.48 16.2 18.5 L 16.2 39.49 C 16.2 43.6 18.68 45.37 21.32 45.37 C 22.43 45.37 23.56 45.01 24.82 44.38 L 43.29 33.88 C 45.42 32.77 46.65 30.88 46.65 29.02 C 46.53 27.1 45.27 25.36 43.29 24.1 L 24.82 13.61 C 23.56 12.98 22.46 12.62 21.32 12.62 Z M 24.58 22.49 L 27.45 22.49 L 32.57 35.59 L 29.94 35.59 L 28.68 32.35 L 23.32 32.35 L 22.22 35.59 L 19.46 35.59 Z M 34.07 22.49 L 36.56 22.49 L 36.56 35.59 L 34.07 35.59 Z M 26.08 24.49 C 25.96 24.61 25.96 24.73 25.84 25 C 25.72 25.36 25.72 25.63 25.6 25.75 C 25.6 25.87 24.97 27.37 23.86 30.49 L 28.11 30.49 C 26.95 27.34 26.32 25.72 26.32 25.6 C 26.32 25.24 26.08 24.85 26.08 24.49 Z"
                  fill="#ff6a00"
                  stroke="none"
                  pointer-events="all"
                  style="fill: light-dark(rgb(255, 106, 0), rgb(233, 105, 14));"
                />
              </g>
            </g>
            <g data-cell-id="SLQSbJwD_n-blhHmYasz-2">
              <g transform="translate(0.5,0.5)">
                <rect x="70" y="9.55" width="100" height="40" fill="none" stroke="none" pointer-events="all" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 234 42"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g>
        <g data-cell-id="0">
          <g data-cell-id="1">
            <g data-cell-id="SLQSbJwD_n-blhHmYasz-1">
              <g transform="translate(0.5,0.5)">
                <path
                  d="M 30.81 0.11 C 25.79 0 20.89 1.16 16.54 3.44 C 15.66 3.71 14.97 4.56 14.97 5.48 C 14.97 6.74 15.96 7.61 17.1 7.61 C 17.43 7.61 17.74 7.52 19.84 6.43 C 21.95 5.33 26.32 4.34 30.69 4.46 C 37.54 4.58 43.92 7.46 48.65 12.32 C 53.38 17.18 55.87 23.69 55.75 30.43 C 55.75 33.68 55.1 36.77 53.9 39.61 C 53.86 39.61 53.82 39.61 53.77 39.61 C 51.71 39.61 50.03 41.35 50.03 43.48 C 50.03 45.61 51.71 47.34 53.77 47.34 C 55.84 47.34 57.51 45.61 57.51 43.48 C 57.51 42.89 57.38 42.33 57.15 41.83 C 58.83 38.05 59.78 34.18 59.88 30.22 C 60 22.34 57.16 14.99 51.65 9.23 C 46.14 3.47 38.8 0.35 30.81 0.11 Z M 7.72 9.11 C 5.66 9.11 3.98 10.85 3.98 12.98 C 3.98 13.65 4.15 14.29 4.44 14.84 C 1.98 18.98 0.5 23.81 0.36 28.84 C 0 45.1 13.08 58.59 29.55 59.1 L 30.3 59.1 C 36.53 59.1 42.51 57.09 47.75 53.34 C 48.02 53.07 48.26 52.59 48.26 52.08 C 48.26 50.94 47.37 50.07 46.26 50.07 C 45.63 50.07 45.24 50.22 44.88 50.58 C 40.27 53.7 35.03 55.32 29.55 55.2 C 22.69 55.08 16.32 52.2 11.59 47.34 C 6.86 42.49 4.37 35.98 4.49 29.23 C 4.6 24.93 5.93 20.63 8.24 16.81 C 10.06 16.55 11.47 14.93 11.47 12.98 C 11.47 10.85 9.79 9.11 7.72 9.11 Z M 21.32 12.62 C 18.83 12.62 16.2 14.48 16.2 18.5 L 16.2 39.49 C 16.2 43.6 18.68 45.37 21.32 45.37 C 22.43 45.37 23.56 45.01 24.82 44.38 L 43.29 33.88 C 45.42 32.77 46.65 30.88 46.65 29.02 C 46.53 27.1 45.27 25.36 43.29 24.1 L 24.82 13.61 C 23.56 12.98 22.46 12.62 21.32 12.62 Z M 24.58 22.49 L 27.45 22.49 L 32.57 35.59 L 29.94 35.59 L 28.68 32.35 L 23.32 32.35 L 22.22 35.59 L 19.46 35.59 Z M 34.07 22.49 L 36.56 22.49 L 36.56 35.59 L 34.07 35.59 Z M 26.08 24.49 C 25.96 24.61 25.96 24.73 25.84 25 C 25.72 25.36 25.72 25.63 25.6 25.75 C 25.6 25.87 24.97 27.37 23.86 30.49 L 28.11 30.49 C 26.95 27.34 26.32 25.72 26.32 25.6 C 26.32 25.24 26.08 24.85 26.08 24.49 Z"
                  fill="#ff6a00"
                  stroke="none"
                  pointer-events="all"
                  style="fill: light-dark(rgb(255, 106, 0), rgb(233, 105, 14));"
                />
              </g>
            </g>
            <g data-cell-id="SLQSbJwD_n-blhHmYasz-2">
              <g transform="translate(0.5,0.5)">
                <rect x="70" y="9.55" width="100" height="40" fill="none" stroke="none" pointer-events="all" />
              </g>
              <g>
                <g>
                  <switch>
                    <foreignObject
                      style="overflow: visible; text-align: left;"
                      pointer-events="none"
                      width="100%"
                      height="100%"
                      requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                    >
                      <div style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 1px; height: 1px; padding-top: 30px; margin-left: 120px;">
                        <div style="box-sizing: border-box; font-size: 0; text-align: center; color: #EA6B66; ">
                          <div style="display: inline-block; font-size: 24px; font-family: 'Comic Sans MS'; color: light-dark(#EA6B66, #d0635f); line-height: 1.2; pointer-events: all; font-weight: bold; white-space: nowrap; ">
                            LzCode
                          </div>
                        </div>
                      </div>
                    </foreignObject>
                    <text
                      x="120"
                      y="37"
                      fill="#EA6B66"
                      font-family="'Comic Sans MS'"
                      font-size="24px"
                      text-anchor="middle"
                      font-weight="bold"
                    >
                      LzCode
                    </text>
                  </switch>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
