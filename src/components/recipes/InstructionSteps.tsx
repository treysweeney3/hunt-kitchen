"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { RecipeInstruction } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface InstructionStepsProps {
  instructions: RecipeInstruction[];
  recipeId?: string;
  className?: string;
}

export function InstructionSteps({
  instructions,
  recipeId,
  className,
}: InstructionStepsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Load completed state from localStorage if recipeId is provided
  useEffect(() => {
    if (recipeId) {
      const stored = localStorage.getItem(`recipe-steps-${recipeId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCompletedSteps(new Set(parsed));
        } catch (error) {
          console.error("Failed to parse stored steps", error);
        }
      }
    }
  }, [recipeId]);

  // Save completed state to localStorage
  useEffect(() => {
    if (recipeId) {
      localStorage.setItem(
        `recipe-steps-${recipeId}`,
        JSON.stringify(Array.from(completedSteps))
      );
    }
  }, [completedSteps, recipeId]);

  const handleToggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  };

  const completedCount = completedSteps.size;
  const totalCount = instructions.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  // Normalize and sort instructions - handle both {step, imageUrl} and {stepNumber, text, imageUrl} formats
  const sortedInstructions = [...instructions]
    .map((instruction, index) => ({
      stepNumber: instruction.stepNumber ?? index + 1,
      text: instruction.text ?? (instruction as unknown as { step: string }).step ?? '',
      imageUrl: instruction.imageUrl,
    }))
    .sort((a, b) => a.stepNumber - b.stepNumber);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <Separator />

      {/* Instructions List */}
      <div className="space-y-6">
        {sortedInstructions.map((instruction, index) => {
          const isCompleted = completedSteps.has(instruction.stepNumber);
          return (
            <div
              key={`instruction-${index}`}
              onClick={() => handleToggleStep(instruction.stepNumber)}
              className={cn(
                "relative flex gap-4 p-4 rounded-lg transition-all cursor-pointer",
                isCompleted
                  ? "bg-muted/50 opacity-70"
                  : "bg-background hover:bg-muted/30"
              )}
            >
              {/* Step Number Badge */}
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full font-semibold text-lg transition-all",
                    isCompleted
                      ? "bg-[#2D5A3D] text-white"
                      : "bg-[#F5F2EB] text-[#4A3728]"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span>{instruction.stepNumber}</span>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span
                      className={cn(
                        "text-base leading-relaxed font-normal",
                        isCompleted && "line-through text-muted-foreground"
                      )}
                    >
                      {instruction.text}
                    </span>
                  </div>
                  <Checkbox
                    checked={isCompleted}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() =>
                      handleToggleStep(instruction.stepNumber)
                    }
                    className="mt-1"
                  />
                </div>

                {/* Step Image */}
                {instruction.imageUrl && (
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <AspectRatio ratio={16 / 9}>
                      <Image
                        src={instruction.imageUrl}
                        alt={`Step ${instruction.stepNumber}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                    </AspectRatio>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
