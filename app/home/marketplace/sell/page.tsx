"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import routes from "@/routes/routes";
import { categories } from "@/data/categories";
import { useMutation } from "@tanstack/react-query";
import { createListing } from "@/service/marketplace_service";
import { toast } from "sonner";

const CONDITION_OPTIONS = ["New", "Like New", "Good", "Acceptable"];
const MAX_IMAGES = 10;

function SellPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const listingMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      toast.success("Listing created successfully!");
      router.push(routes.marketplace);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to create listing";
      toast.error(message);
    },
  });

  const formFields = [
    { key: "title", value: title.trim() },
    { key: "author", value: author.trim() },
    { key: "price", value: price },
    { key: "condition", value: condition },
    { key: "category", value: category },
    { key: "description", value: description.trim() },
  ];

  const isFormValid = formFields.every((f) => !!f.value) && images.length > 0;

  const handleSubmit = () => {
    if (!isFormValid) return;
    listingMutation.mutate({
      title: title.trim(),
      author: author.trim(),
      price,
      condition,
      category,
      description: description.trim(),
      images,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > MAX_IMAGES) {
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto pt-20 px-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold">Sell Your Item</h1>
      </div>

      {/* Photo Upload */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-1">Photos</h2>
        <p className="text-sm text-zinc-500 mb-4">
          {`Add clear photos to show buyers your item. You can upload up to ${MAX_IMAGES} images.`}
        </p>
        <div className="grid grid-cols-4 gap-3">
          {previews.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group"
            >
              <Image
                src={src}
                alt={`Upload ${i + 1}`}
                fill
                className="object-cover"
              />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center gap-1.5 hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ImagePlus className="size-6 text-zinc-400" />
              <span className="text-xs text-zinc-400">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
      </section>

      {/* Title */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Title</h2>
        <p className="text-sm text-zinc-500 mb-3">
          Use words people would search for when looking for your item.
        </p>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Calculus Early Transcendentals 8th Edition"
          maxLength={80}
          className="w-full"
        />
        <p className="text-xs text-zinc-400 mt-1.5 text-right">
          {title.length}/80
        </p>
      </section>

      {/* Item Specifics */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Item Specifics</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Buyers need these details to find your item.
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {/* Author */}
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
              Author
            </label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
              Price (CA$)
            </label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min={0}
            />
          </div>

          {/* Condition */}
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
            >
              <option value="">–</option>
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
            >
              <option value="">–</option>
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-1">Description</h2>
        <p className="text-sm text-zinc-500 mb-3">
          Tell buyers about your item — condition details, highlights, etc.
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your item..."
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
        />
        <p className="text-xs text-zinc-400 mt-1.5 text-right">
          {description.length}/2000
        </p>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200">
        <Link href={routes.marketplace}>
          <Button variant="outline" className="px-8 cursor-pointer">
            Cancel
          </Button>
        </Link>
        <Button
          className="px-8 bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
          disabled={!isFormValid || listingMutation.isPending}
          onClick={handleSubmit}
        >
          {listingMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Listing...
            </>
          ) : (
            "List It"
          )}
        </Button>
      </div>
    </div>
  );
}

export default SellPage;
