"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle2, Circle } from "lucide-react";
import { RecipeInstruction } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  const allCompleted = completedCount === totalCount;

  // Sort instructions by step number
  const sortedInstructions = [...instructions].sort(
    (a, b) => a.stepNumber - b.stepNumber
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Instructions</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <Separator />

      {/* Instructions List */}
      <div className="space-y-6">
        {sortedInstructions.map((instruction) => {
          const isCompleted = completedSteps.has(instruction.stepNumber);
          return (
            <div
              key={instruction.stepNumber}
              className={cn(
                "relative flex gap-4 p-4 rounded-lg transition-all",
                isCompleted
                  ? "bg-muted/50 opacity-70"
                  : "bg-background hover:bg-muted/30"
              )}
            >
              {/* Step Number Badge */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleToggleStep(instruction.stepNumber)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full font-semibold text-lg transition-all",
                    isCompleted
                      ? "bg-[#2D5A3D] text-white"
                      : "bg-[#F5F2EB] text-[#4A3728] hover:bg-[#E07C24] hover:text-white"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span>{instruction.stepNumber}</span>
                  )}
                </button>
              </div>

              {/* Step Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label
                      className={cn(
                        "text-base leading-relaxed cursor-pointer font-normal",
                        isCompleted && "line-through"
                      )}
                      onClick={() => handleToggleStep(instruction.stepNumber)}
                    >
                      {instruction.text}
                    </Label>
                  </div>
                  <Checkbox
                    checked={isCompleted}
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

      {/* Completion Message */}
      {allCompleted && completedCount > 0 && (
        <div className="bg-[#2D5A3D] text-white rounded-lg p-6 text-center space-y-2">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
          <h4 className="font-semibold text-xl">Recipe Complete!</h4>
          <p className="text-white/90">
            Great job! Your dish should be ready to enjoy.
          </p>
        </div>
      )}

      {/* Visual Progress Timeline */}
      {totalCount > 1 && (
        <div className="relative pt-4">
          <div className="flex justify-between items-center">
            {sortedInstructions.map((instruction, index) => {
              const isCompleted = completedSteps.has(instruction.stepNumber);
              const isLast = index === sortedInstructions.length - 1;

              return (
                <div key={instruction.stepNumber} className="flex items-center">
                  <button
                    onClick={() => handleToggleStep(instruction.stepNumber)}
                    className="relative z-10"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-[#2D5A3D] fill-[#2D5A3D]" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                  </button>
                  {!isLast && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-1",
                        isCompleted &&
                          completedSteps.has(instruction.stepNumber + 1)
                          ? "bg-[#2D5A3D]"
                          : "bg-gray-300"
                      )}
                      style={{
                        width: `${100 / (totalCount - 1)}px`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
