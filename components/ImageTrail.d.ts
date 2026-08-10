import type { ReactElement } from "react";

type ImageTrailProps = {
  items?: string[];
  variant?: number;
};

declare function ImageTrail(props: ImageTrailProps): ReactElement;

export default ImageTrail;
