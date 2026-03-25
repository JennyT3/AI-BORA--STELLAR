import { Composition } from "remotion";
import { Master } from "./Master";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AIBoraHero"
      component={Master}
      durationInFrames={360}
      fps={30}
      width={1080}
      height={700}
    />
  );
};
