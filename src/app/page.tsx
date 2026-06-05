import { Suspense } from "react";
import { DecoderApp } from "@/components/decoder-app";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <DecoderApp />
    </Suspense>
  );
}
