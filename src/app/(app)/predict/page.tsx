import PredictionMarketsContent from "./PredictionMarketsContent";
import { FeatureGate } from "@/components/common/FeatureGate";

export const dynamic = "force-dynamic";

export default function PredictionMarketsPage() {
  return (
    <FeatureGate flag="PREDICTION_MARKETS">
      <PredictionMarketsContent />
    </FeatureGate>
  );
}
