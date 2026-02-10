"use client";

import { useState, useEffect } from "react";
import { Dumbbell, FileText, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: string;
  name: string;
  exercises: {
    id: string;
    exercise: {
      id: string;
      name: string;
      muscleGroup: string | null;
    };
  }[];
}

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export function TemplatePicker({ open, onClose, onSelect }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl px-0">
        <SheetHeader className="px-4 pb-3">
          <SheetTitle>Start from Template</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(60vh-80px)]">
          <div className="px-4 space-y-2">
            {loading && (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && templates.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No templates yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Save a workout as a template to reuse it
                </p>
              </div>
            )}

            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="w-full text-left p-4 rounded-xl border hover:bg-muted/50 active:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{template.name}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.exercises.map((te) => (
                    <Badge key={te.id} variant="secondary" className="text-[10px]">
                      {te.exercise.name}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
