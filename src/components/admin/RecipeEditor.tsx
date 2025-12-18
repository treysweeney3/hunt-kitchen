"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import slugify from "slugify";

const ingredientSchema = z.object({
  amount: z.string(),
  unit: z.string(),
  ingredient: z.string(),
  notes: z.string().optional(),
});

const instructionSchema = z.object({
  step: z.string(),
  imageUrl: z.string().optional(),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  featuredImageUrl: z.string().optional(),
  gameTypeId: z.string().min(1, "Game type is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  prepTimeMinutes: z.coerce.number().min(0).optional(),
  cookTimeMinutes: z.coerce.number().min(0).optional(),
  servings: z.coerce.number().min(1).optional(),
  ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
  instructions: z.array(instructionSchema).min(1, "At least one instruction is required"),
  tips: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeEditorProps {
  recipe?: RecipeFormValues & { id?: string };
  gameTypes: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function RecipeEditor({ recipe, gameTypes, categories }: RecipeEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema) as any,
    defaultValues: recipe || {
      title: "",
      slug: "",
      description: "",
      gameTypeId: "",
      categoryIds: [],
      ingredients: [{ amount: "", unit: "", ingredient: "", notes: "" }],
      instructions: [{ step: "", imageUrl: "" }],
      isFeatured: false,
      isPublished: false,
    },
  });

  const onSubmit = async (data: RecipeFormValues) => {
    setIsSubmitting(true);
    try {
      const url = recipe?.id
        ? `/api/admin/recipes/${recipe.id}`
        : "/api/admin/recipes";
      const method = recipe?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          totalTimeMinutes: (data.prepTimeMinutes || 0) + (data.cookTimeMinutes || 0),
          publishedAt: data.isPublished ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      toast.success(recipe?.id ? "Recipe updated!" : "Recipe created!");
      router.push("/admin/recipes");
      router.refresh();
    } catch (error) {
      toast.error("Failed to save recipe");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = slugify(title, { lower: true, strict: true });
      form.setValue("slug", slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Grilled Venison Backstrap"
                          onBlur={() => {
                            field.onBlur();
                            if (!form.getValues("slug")) {
                              generateSlug();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} placeholder="grilled-venison-backstrap" />
                        </FormControl>
                        <Button type="button" variant="outline" onClick={generateSlug}>
                          Generate
                        </Button>
                      </div>
                      <FormDescription>URL-friendly version of the title</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your recipe..."
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gameTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a game type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gameTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="prepTimeMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prep Time (min)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cookTimeMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cook Time (min)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="servings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Servings</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.watch("ingredients")?.map((_, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1 grid grid-cols-12 gap-2">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.amount`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormControl>
                              <Input {...field} placeholder="2" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.unit`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormControl>
                              <Input {...field} placeholder="cups" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.ingredient`}
                        render={({ field }) => (
                          <FormItem className="col-span-5">
                            <FormControl>
                              <Input {...field} placeholder="venison, diced" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.notes`}
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormControl>
                              <Input {...field} placeholder="optional notes" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const current = form.getValues("ingredients");
                        form.setValue(
                          "ingredients",
                          current.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const current = form.getValues("ingredients");
                    form.setValue("ingredients", [
                      ...current,
                      { amount: "", unit: "", ingredient: "", notes: "" },
                    ]);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.watch("instructions")?.map((_, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <FormField
                        control={form.control}
                        name={`instructions.${index}.step`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Describe this step..."
                                rows={3}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const current = form.getValues("instructions");
                        form.setValue(
                          "instructions",
                          current.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const current = form.getValues("instructions");
                    form.setValue("instructions", [
                      ...current,
                      { step: "", imageUrl: "" },
                    ]);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </Button>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="tips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tips</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Any helpful tips for this recipe..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://youtube.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Leave blank to use recipe title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brief description for search engines..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Published</FormLabel>
                        <FormDescription>Make this recipe visible to users</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>Show on homepage</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-2 pt-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : recipe?.id
                      ? "Update Recipe"
                      : "Create Recipe"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value?.includes(category.id)}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...current, category.id]);
                                } else {
                                  field.onChange(
                                    current.filter((id) => id !== category.id)
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </FormControl>
                          <Label className="text-sm font-normal cursor-pointer">
                            {category.name}
                          </Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
