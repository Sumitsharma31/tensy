import { LoadingScreen } from "@/components/common/loading-screen"

export default function Loading() {
  return (
    <LoadingScreen
      fullScreen
      message="Loading Tense Grammar Playground"
      submessage="Preparing your learning experience..."
    />
  )
}
