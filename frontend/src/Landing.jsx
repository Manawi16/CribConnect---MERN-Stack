// import { motion } from "framer-motion";
// import MapStage from "./MapStage";

// export default function CribConnectHomepage() {
//   return (
//     <div className="relative">
//       <MapStage />
//     </div>
//   );
// }

// src/Landing.jsx
import { motion } from "framer-motion";
import MapStage from "./MapStage";

export default function Landing({ scrollContainerRef, onWipeStart }) {
  return (
    <div className="relative">
      <MapStage scrollContainerRef={scrollContainerRef} onWipeStart={onWipeStart} />
    </div>
  );
}