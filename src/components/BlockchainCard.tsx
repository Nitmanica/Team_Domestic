import { ExternalLink, Copy } from "lucide-react";

interface BlockchainCardProps {
  txHash: string;
  network: string;
  gasUsed?: string;
  status: string;
  timestamp: string;
}

export const BlockchainCard = ({ txHash, network, gasUsed, status, timestamp }: BlockchainCardProps) => {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Blockchain Transaction</span>
        <span className="text-xs text-muted-foreground">{network}</span>
      </div>
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
        <code className="text-xs text-foreground flex-1 truncate font-mono">{txHash}</code>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button className="text-muted-foreground hover:text-secondary transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{timestamp}</span>
        {gasUsed && <span className="text-muted-foreground">Gas: {gasUsed}</span>}
        <span className="text-success font-medium">{status}</span>
      </div>
    </div>
  );
};
