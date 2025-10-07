import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategories, Category } from "@/hooks/useCategories";
import { Settings, Plus, Trash2, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e"
];

export const CategoryManagementDialog = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      await updateCategory.mutateAsync({ id: editingId, name, color: selectedColor });
      setEditingId(null);
    } else {
      await addCategory.mutateAsync({ name, color: selectedColor });
    }
    
    setName("");
    setSelectedColor(COLORS[0]);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setSelectedColor(category.color);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setSelectedColor(COLORS[0]);
  };

  const handleDelete = async (id: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק קטגוריה זו?")) {
      await deleteCategory.mutateAsync(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="ml-2 h-4 w-4" />
          ניהול קטגוריות
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>ניהול קטגוריות</DialogTitle>
          <DialogDescription>
            הוסף, ערוך או מחק קטגוריות למנויים שלך
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם הקטגוריה</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: תוכנה, בידור, עסק"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>בחר צבע</Label>
            <div className="grid grid-cols-9 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-10 w-10 rounded-md border-2 transition-all ${
                    selectedColor === color ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={!name.trim()}>
              {editingId ? (
                <>
                  <Edit className="ml-2 h-4 w-4" />
                  עדכן קטגוריה
                </>
              ) : (
                <>
                  <Plus className="ml-2 h-4 w-4" />
                  הוסף קטגוריה
                </>
              )}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                ביטול
              </Button>
            )}
          </div>
        </form>

        <div className="space-y-2 mt-6">
          <Label>קטגוריות קיימות</Label>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              אין קטגוריות עדיין. הוסף את הקטגוריה הראשונה שלך!
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <Card key={category.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-md"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
