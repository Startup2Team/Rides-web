import type { NegotiationStatus } from "@/app/admin/(authed)/negotiations/negotiation-modal";

export const DEFAULT_MAX_NEGOTIATION_ROUNDS = 3;
export const DEFAULT_MASKED_CALL_SEC = 30;

export function parseMaxRounds(value: unknown): number {
  const n = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_NEGOTIATION_ROUNDS;
}

export function parseMaskedCallSec(value: unknown): number {
  const n = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MASKED_CALL_SEC;
}

export function negotiationChatEnded(status: NegotiationStatus): boolean {
  return status !== "In progress";
}

export function fareChatAtLimit(rounds: number, maxRounds: number): boolean {
  return rounds >= maxRounds;
}

export type CommFilter = "all" | "chat" | "call";

export function matchesCommFilter(
  n: { status: NegotiationStatus; final: number | null },
  filter: CommFilter,
): boolean {
  switch (filter) {
    case "chat":
      return n.status === "In progress";
    case "call":
      return n.status !== "In progress";
    case "all":
    default:
      return n.status === "Agreed" && n.final !== null;
  }
}

export function communicationMode(status: NegotiationStatus): "Chat" | "Call" {
  return status === "In progress" ? "Chat" : "Call";
}
