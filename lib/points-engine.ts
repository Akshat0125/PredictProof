export function calculatePointsDelta(
  predictedSide: "YES" | "NO",
  winningSide: "YES" | "NO"
): number {
  return predictedSide === winningSide ? 10 : -10;
}
