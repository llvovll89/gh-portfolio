// @types/react-syntax-highlighter(15.x)에 아직 없는 스타일 모듈 선언
declare module "react-syntax-highlighter/dist/esm/styles/prism/a11y-one-light" {
    import type { CSSProperties } from "react";
    const style: { [key: string]: CSSProperties };
    export default style;
}
