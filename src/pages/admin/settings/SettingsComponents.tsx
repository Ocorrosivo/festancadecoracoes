import React, { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Star, Award, Shield, Users, Check, Sparkles, Smile, Target, Zap } from "lucide-react";

export const Block = ({
  title, icon: Icon, defaultOpen = true, children
}: { title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
      <button
        type="button"
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent/30 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-primary" />
          <span className="font-bold text-base">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 space-y-5">{children}</div>}
    </div>
  );
};

export const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="mb-1.5">
    <label className="text-sm font-medium text-foreground">{children}</label>
    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
  </div>
);

const ICONS = [
  { name: "Heart", icon: Heart }, { name: "Star", icon: Star },
  { name: "Award", icon: Award }, { name: "Shield", icon: Shield },
  { name: "Users", icon: Users }, { name: "Check", icon: Check },
  { name: "Sparkles", icon: Sparkles }, { name: "Smile", icon: Smile },
  { name: "Target", icon: Target }, { name: "Zap", icon: Zap }
];

export const IconPicker = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {ICONS.map(({ name, icon: IconComponent }) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
            value === name ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-muted-foreground hover:bg-accent"
          }`}
          title={name}
        >
          <IconComponent size={20} />
        </button>
      ))}
      <Input
        className="w-32 h-10 ml-2"
        placeholder="Outro (nome)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

interface CompactCardProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
}

const ChevronRightIcon = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export const CompactCard = ({ title, isExpanded, onToggle, onMoveUp, onMoveDown, onDelete, isFirst, isLast, children }: CompactCardProps) => {
  return (
    <div className="border border-border rounded-xl bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/40 transition-colors">
        <button type="button" onClick={onToggle} className="flex-1 flex items-center text-left font-medium text-sm truncate pr-4">
          {isExpanded ? <ChevronDown size={16} className="mr-2 shrink-0 text-muted-foreground" /> : <ChevronRightIcon size={16} className="mr-2 shrink-0 text-muted-foreground" />}
          {title || "Novo Item"}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onMoveUp} disabled={isFirst}>
            <ArrowUp size={14} />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onMoveDown} disabled={isLast}>
            <ArrowDown size={14} />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
            if (window.confirm("Remover este item? O item será excluído do banco apenas após Salvar.")) onDelete();
          }}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      {isExpanded && <div className="p-4 border-t border-border space-y-4">{children}</div>}
    </div>
  );
};
